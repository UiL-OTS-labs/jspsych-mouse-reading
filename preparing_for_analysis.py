"""
Author: Jakub Dotlacil

This script takes a json file from the mouse tracking experiment.
It outputs four files:

file ending with _main_data.csv: This stores all the information from the json file
file ending with _rects_details.csv: This csv stores only the information about the position of words on the screen, in x and y coordinates in a long format (one word per row).
file ending with _mouseEvents_details.csv: This csv stores only the information about the amount of time that the cursor was inside the block of each word, and stores information about whether this was the first pass or the second pass. The csv is in a long format (one word per row).
file ending with _other_list_event_details.csv: This csv stores all other event details information.

For your analysis you should mainly care about the file ending with _mouseEvents_details.csv.

"""

import json
import pandas as pd
import os
import sys


def _extract_and_create_df(
    df_main,
    source_column_name,       # The actual column name in df_main to process
    target_df_key,            # Key for the new DataFrame in the output dict
    event_columns_to_extract, # Specific columns to pull from the nested dicts
    parent_columns_to_link,   # Parent columns from df_main to link
    dataframes_dict           # The dictionary to add the new DataFrame to
):
    """
    Helper function to extract nested list data from a source column in df_main,
    create a new DataFrame, and add it to dataframes_dict.
    """
    if source_column_name not in df_main.columns:
        # This check is mostly redundant if called after confirming column existence,
        # but good for standalone use.
        print(f"Info: Source column '{source_column_name}' not found. Skipping for '{target_df_key}'.")
        return

    all_records = []
    for index, row in df_main.iterrows():
        data_cell = row[source_column_name]

        na_check_result = pd.isna(data_cell)
        if isinstance(na_check_result, bool):
            if na_check_result: # Scalar NA
                continue
        # If na_check_result is array-like, data_cell is array-like and not scalar NA.
        # It will be handled by the isinstance checks below.
        
        processed_data_list = None
        if isinstance(data_cell, str):
            try:
                processed_data_list = json.loads(data_cell)
            except (json.JSONDecodeError, TypeError):
                # print(f"Warning: Could not parse string in column '{source_column_name}' at index {index} for '{target_df_key}'.")
                continue
        elif isinstance(data_cell, list):
            processed_data_list = data_cell
        else:
            # Not a string or list (could be an np.array or other type if not scalar NA)
            # print(f"Warning: Data in column '{source_column_name}' at index {index} is not string or list for '{target_df_key}'. Type: {type(data_cell)}")
            continue

        if isinstance(processed_data_list, list):
            for i, event_data_dict in enumerate(processed_data_list):
                if isinstance(event_data_dict, dict):
                    record = {}
                    # Extract specified event columns
                    for col in event_columns_to_extract:
                        record[col] = event_data_dict.get(col) # Use .get() for safety if a key is missing
                    
                    # Add prefixed parent linking columns
                    for p_col in parent_columns_to_link:
                        if p_col in row and pd.notna(row[p_col]):
                            record[f'parent_{p_col}'] = row[p_col]
                    all_records.append(record)

                    if target_df_key == "mouseEvents_details":

                        record["order"] = i//2

    if target_df_key == "mouseEvents_details":
        
        temp_med = pd.DataFrame(all_records)
        
        grouped = temp_med.groupby(['parent_trial_index', 'order'])

        all_records = []

        max_reading_idx = {trial_index: -1 for (trial_index, _), _ in grouped}

        for (trial_index, order), group in grouped:
            if set(group['type']) == {'enter', 'leave'}:
                enter_t = group.loc[group['type'] == 'enter', 't'].values[0]
                leave_t = group.loc[group['type'] == 'leave', 't'].values[0]
                idx = int(group.loc[group['type'] == 'enter', 'idx'].values[0])
                t_diff = leave_t - enter_t

                # Copy relevant columns, excluding 'type' and 't'
                row_data = group.iloc[0].drop(['type', 't']).to_dict()
                row_data['time'] = t_diff

                if idx > max_reading_idx[trial_index]:
                    row_data["reading_measure"] = "first_pass"
                    max_reading_idx[trial_index] = idx
                else:
                    row_data["reading_measure"] = "second_pass"
                
                all_records.append(row_data)

    if all_records:
        dataframes_dict[target_df_key] = pd.DataFrame(all_records)
        # print(f"Info: Successfully extracted '{target_df_key}' DataFrame with {len(all_records)} records from '{source_column_name}'.")
    # else:
        # print(f"Info: No records extracted for '{target_df_key}' from column '{source_column_name}'.")


def create_dataframes_from_json_file(file_path):
    """
    Loads data from a JSON file and creates pandas DataFrames.
    It creates a main DataFrame, normalizes nested dictionary columns,
    and extracts specified and general list-like data (e.g., rects, mouseEvents, 
    other mouse tracking) into separate DataFrames.

    Args:
        file_path (str): The path to the JSON file.

    Returns:
        dict: A dictionary of pandas DataFrames.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at '{file_path}'")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from '{file_path}': {e}")
        return {}

    if not raw_data:
        print("Warning: JSON data is empty. Returning an empty main DataFrame.")
        return {'main_data': pd.DataFrame()}
    
    if not isinstance(raw_data, list):
        raw_data = [raw_data]

    try:
        df_main = pd.json_normalize(raw_data)
    except Exception as e:
        print(f"Error during initial normalization with pd.json_normalize: {e}")
        print("Attempting basic pd.DataFrame() conversion instead.")
        try:
            df_main = pd.DataFrame(raw_data)
        except Exception as e2:
            print(f"Basic pd.DataFrame() conversion also failed: {e2}")
            return {}

    dataframes = {'main_data': df_main.copy()}
    
    # --- Configuration for extracting various nested list data ---
    extraction_configs = [
        {
            "source_column_name_candidates": ["rects"],
            "target_df_key": "rects_details",
            "event_columns_to_extract": ['x', 'y', 'idx', 'word'],
            "parent_columns_to_link": ['trial_index', 'subject', 'internal_node_id']
        },
        {
            "source_column_name_candidates": ["mouseEvents"],
            "target_df_key": "mouseEvents_details",
            "event_columns_to_extract": ['type', 'idx', 'word', 't'],
            "parent_columns_to_link": ['trial_index', 'subject', 'internal_node_id']
        },
        {
            "source_column_name_candidates": [ # General catch-all for other event lists
                'mouse_tracking_data', 'mouseData', 'mouse_moves', 
                'stimulus_wise_mouse_data', 'mt_data', 'mousetrack_data',
                'fixations', 'gaze_data', 'events' # 'events' is common, good to have
            ], 
            "target_df_key": "other_list_event_details", 
            "event_columns_to_extract": [ # A broader set of common event fields
                'x', 'y', 't', 'event', 'type', 'value', 'timestamp', 
                'duration', 'page_x', 'page_y', 'button', 'key'
            ],
            "parent_columns_to_link": [ # Broader set for general linking
                'trial_index', 'subject', 'internal_node_id', 'time_elapsed', 'trial_type'
            ]
        }
    ]

    processed_source_columns = set() # To avoid processing the same source column multiple times

    for config in extraction_configs:
        actual_source_column_found = None
        for candidate_col in config["source_column_name_candidates"]:
            if candidate_col in df_main.columns and candidate_col not in processed_source_columns:
                actual_source_column_found = candidate_col
                break # Found a suitable, unprocessed column for this config
        
        if actual_source_column_found:
            _extract_and_create_df(
                df_main,
                actual_source_column_found,
                config["target_df_key"],
                config["event_columns_to_extract"],
                config["parent_columns_to_link"],
                dataframes # Pass the main dataframes dictionary
            )
            processed_source_columns.add(actual_source_column_found)

    # --- Normalize other columns in main_data that are simple dictionaries ---
    current_main_df = dataframes['main_data'].copy() # Use the current state of main_data
    columns_to_drop_from_main = []
    newly_normalized_dfs = []

    for col in current_main_df.columns:
        # Skip if this column was processed as a source for list extraction
        if col in processed_source_columns:
            continue

        non_null_col_series = current_main_df[col].dropna()
        if not non_null_col_series.empty:
            are_all_dicts = all(isinstance(item, dict) for item in non_null_col_series)
            if are_all_dicts:
                valid_dict_indices = non_null_col_series.index
            
                if not valid_dict_indices.empty:
                    # Normalize this column for the rows that actually contain dicts
                    normalized_part = pd.json_normalize(current_main_df.loc[valid_dict_indices, col])
                    normalized_part = normalized_part.add_prefix(f'{col}_')
                    
                    # Create a temporary df with the full index of current_main_df for this normalized part
                    # ensuring alignment for concatenation.
                    temp_normalized_df = pd.DataFrame(index=current_main_df.index, columns=normalized_part.columns)
                    temp_normalized_df.loc[valid_dict_indices] = normalized_part.values

                    newly_normalized_dfs.append(temp_normalized_df)
                    columns_to_drop_from_main.append(col)

    if columns_to_drop_from_main:
        main_df_base = current_main_df.drop(columns=columns_to_drop_from_main, errors='ignore')
        # Filter out any all-NaN columns from newly_normalized_dfs before concat,
        # which can happen if a dict column only had empty dicts or dicts that normalized to nothing.
        newly_normalized_dfs_filtered = [df for df in newly_normalized_dfs if not df.isnull().all().all()]
        if newly_normalized_dfs_filtered:
             dataframes['main_data'] = pd.concat([main_df_base] + newly_normalized_dfs_filtered, axis=1)
        else: # If all normalized parts were empty
            dataframes['main_data'] = main_df_base
        
    return dataframes

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("To use the file, you have to specify the json file name when calling the script.")
        print("python preparing_for_analysis.py <json-file-name>")
        sys.exit(1)

    input_json_file = sys.argv[1]

    base_output_name = os.path.splitext(os.path.basename(input_json_file))[0]

    print(f"Processing file: {input_json_file}")
    created_dataframes = create_dataframes_from_json_file(input_json_file)

    if created_dataframes:
        print(f"\n--- Saving DataFrames to CSV ---")
        for name, df in created_dataframes.items():
            if df.empty:
                print(f"DataFrame '{name}' is empty. Skipping save.")
                continue
            
            csv_filename = f"{base_output_name}_{name}.csv"
            
            try:
                df.to_csv(csv_filename, index=False, encoding='utf-8')
                print(f"Successfully saved '{name}' to '{csv_filename}' (Shape: {df.shape})")
            except Exception as e:
                print(f"Error saving DataFrame '{name}' to '{csv_filename}': {e}")
            
        print(f"\n--- Summary of Processed DataFrames ---")
        for name, df in created_dataframes.items():
            print(f"DataFrame: '{name}', Shape: {df.shape}")
            # print(df.head()) 
            # print(f"Columns in '{name}': {df.columns.tolist()}")
    else:
        print("No DataFrames were created. Please check error messages above.")
