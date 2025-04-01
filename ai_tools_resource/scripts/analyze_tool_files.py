import json
import os
from pathlib import Path

def load_schema():
    schema_path = Path('ai_tools_resource/data/ai_tool_schema_template.json')
    with open(schema_path) as f:
        return json.load(f)

def analyze_tool_file(file_path, schema):
    with open(file_path) as f:
        tool_data = json.load(f)
    
    missing_fields = []
    required_fields = schema.get('required', [])
    properties = schema.get('properties', {})
    
    # Check required fields
    for field in required_fields:
        if field not in tool_data:
            missing_fields.append(field)
    
    # Check recommended fields
    for field, props in properties.items():
        if field not in required_fields and field not in tool_data:
            missing_fields.append(field)
    
    return {
        'file': str(file_path),
        'missing_fields': missing_fields,
        'missing_count': len(missing_fields),
        'total_fields': len(properties) + len(required_fields)
    }

def main():
    schema = load_schema()
    data_dir = Path('ai_tools_resource/data')
    tool_files = [f for f in data_dir.glob('*.json') if f.name != 'ai_tool_schema_template.json']
    
    analysis_results = []
    for tool_file in tool_files:
        result = analyze_tool_file(tool_file, schema)
        analysis_results.append(result)
    
    # Sort by most missing fields
    analysis_results.sort(key=lambda x: x['missing_count'], reverse=True)
    
    # Save analysis results
    output_path = data_dir / 'tool_analysis_results.json'
    with open(output_path, 'w') as f:
        json.dump(analysis_results, f, indent=2)
    
    print(f"Analysis complete. Results saved to {output_path}")
    print("\nTop tools needing updates:")
    for result in analysis_results[:5]:
        print(f"{result['file']}: {result['missing_count']} missing fields")

if __name__ == '__main__':
    main()