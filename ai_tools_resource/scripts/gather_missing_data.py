import json
from pathlib import Path
from typing import Dict, List, Union
import requests
from datetime import datetime

def load_tool_data(file_path: Path) -> Union[Dict, List]:
    with open(file_path) as f:
        return json.load(f)

def save_tool_data(file_path: Path, data: Union[Dict, List]):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def update_tool_object(tool_data: Dict) -> Dict:
    """Update a single tool object with missing fields"""
    if not isinstance(tool_data, dict):
        return tool_data
        
    tool_name = tool_data.get('name', 'Unknown Tool')
    
    # Update missing fields with placeholders
    if 'description' not in tool_data:
        tool_data['description'] = f"[NEEDS MANUAL ENTRY] Description for {tool_name}"
    
    if 'use_cases' not in tool_data:
        tool_data['use_cases'] = [{
            "title": "[NEEDS MANUAL ENTRY] Example Use Case",
            "description": "[NEEDS MANUAL ENTRY] Description of use case",
            "example": "[NEEDS MANUAL ENTRY] Example implementation"
        }]
    
    if 'training_resources' not in tool_data:
        tool_data['training_resources'] = [{
            "type": "[NEEDS MANUAL ENTRY] Documentation/Tutorial/Course",
            "url": "[NEEDS MANUAL ENTRY] URL to resource",
            "description": "[NEEDS MANUAL ENTRY] Description of resource"
        }]
    
    if 'documentation_url' not in tool_data and 'data_source_urls' in tool_data and tool_data['data_source_urls']:
        tool_data['documentation_url'] = f"{tool_data['data_source_urls'][0].rstrip('/')}/docs"
    elif 'documentation_url' not in tool_data:
        tool_data['documentation_url'] = "[NEEDS MANUAL ENTRY] Documentation URL"
    
    if 'api_url' not in tool_data and 'data_source_urls' in tool_data and tool_data['data_source_urls']:
        tool_data['api_url'] = f"{tool_data['data_source_urls'][0].rstrip('/')}/api"
    elif 'api_url' not in tool_data:
        tool_data['api_url'] = "[NEEDS MANUAL ENTRY] API URL"
    
    if 'sdk_url' not in tool_data and 'data_source_urls' in tool_data and tool_data['data_source_urls']:
        tool_data['sdk_url'] = f"{tool_data['data_source_urls'][0].rstrip('/')}/sdk"
    elif 'sdk_url' not in tool_data:
        tool_data['sdk_url'] = "[NEEDS MANUAL ENTRY] SDK URL"
    
    if 'security_compliance' not in tool_data:
        tool_data['security_compliance'] = {
            "certifications": ["[NEEDS MANUAL ENTRY] List certifications"],
            "data_protection": "[NEEDS MANUAL ENTRY] Data protection details"
        }
    
    # Update last_updated if it exists (don't add to review entries)
    if 'last_updated' in tool_data:
        tool_data['last_updated'] = datetime.now().strftime("%Y-%m-%d")
    
    return tool_data

def update_tool_file(file_path: Path):
    file_data = load_tool_data(file_path)
    
    print(f"\nUpdating {file_path}...")
    
    if isinstance(file_data, list):
        # Process each tool in the array
        updated_data = [update_tool_object(tool) for tool in file_data]
    else:
        # Process single tool object
        updated_data = update_tool_object(file_data)
    
    save_tool_data(file_path, updated_data)
    print(f"Successfully updated {file_path}")

def main():
    data_dir = Path('ai_tools_resource/data')
    tool_files = [f for f in data_dir.glob('*.json') 
                 if f.name not in ['ai_tool_schema_template.json', 'tool_analysis_results.json']]
    
    # Process all tool files
    for tool_file in tool_files:
        update_tool_file(tool_file)

if __name__ == '__main__':
    main()