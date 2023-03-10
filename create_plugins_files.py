"""Simple script to get and write atributes from plugins data."""
import sys
import json


def write_with_separators(
        plugins_list: list,
        plugin_attribute: str,
        workspace_path: str,
        filename: str,
        separator: str = ' ',
    ) -> None:
    """Writes lists into a text file using a separator.

    Receives a list of plugins, retrieves a specific attribute from all them and
    writes them down into a text file separated by a given separator.

    Args:
        plugins_list: A list containing dictionaries with some tutor plugin data.
        plugin_attribute: Should contain the attribute to be retrieved from each plugin dict.
        workspace_path: Github workspace path.
        filename: Filename of the file to be written.
        separator: String containing the separator to use to separate the items of the list.
    """
    plugin_names = [plugin[plugin_attribute] for plugin in plugins_list]
    with open(f'{workspace_path}/{filename}', 'a', encoding='utf8') as file:
        file.write(separator.join(plugin_names))


passed_plugins_list = json.loads(sys.argv[1])
WORKSPACE_PATH = sys.argv[2]

# Write plugins to enable names
write_with_separators(
    passed_plugins_list,
    'plugin_name',
    WORKSPACE_PATH,
    'plugins_to_enable.txt',
    separator=' '
)
# Write plugin requirements
write_with_separators(
    passed_plugins_list,
    'package_name',
    WORKSPACE_PATH,
    'plugins_requirements.txt',
    separator='\n'
)
