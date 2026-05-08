import json
import os

# Built-in process name → category mappings
_BUILTIN: dict[str, str] = {
    # Learning / development tools
    'code.exe':             'learning',
    'pycharm64.exe':        'learning',
    'idea64.exe':           'learning',
    'webstorm64.exe':       'learning',
    'datagrip64.exe':       'learning',
    'rider64.exe':          'learning',
    'studio64.exe':         'learning',   # Android Studio
    'android studio.exe':   'learning',
    'clion64.exe':          'learning',
    'goland64.exe':         'learning',
    'anaconda-navigator.exe': 'learning',
    'jupyter.exe':          'learning',
    'rstudio.exe':          'learning',
    'matlab.exe':           'learning',
    'eclipse.exe':          'learning',
    'devenv.exe':           'learning',   # Visual Studio
    'winmerge.exe':         'learning',
    'git-bash.exe':         'learning',
    'sourcetree.exe':       'learning',
    'postman.exe':          'learning',

    # Entertainment
    'vlc.exe':              'entertainment',
    'spotify.exe':          'entertainment',
    'steam.exe':            'entertainment',
    'epicgameslauncher.exe': 'entertainment',
    'discord.exe':          'entertainment',
    'obs64.exe':            'entertainment',
    'twitch.exe':           'entertainment',
    'netflix.exe':          'entertainment',
    'disneyplus.exe':       'entertainment',
    'prime video.exe':      'entertainment',
    'mpc-hc64.exe':         'entertainment',
    'wmplayer.exe':         'entertainment',
    'itunes.exe':           'entertainment',
    'foobar2000.exe':       'entertainment',
    'winamp.exe':           'entertainment',

    # Productivity
    'winword.exe':          'productivity',
    'excel.exe':            'productivity',
    'powerpnt.exe':         'productivity',
    'outlook.exe':          'productivity',
    'onenote.exe':          'productivity',
    'teams.exe':            'productivity',
    'slack.exe':            'productivity',
    'notion.exe':           'productivity',
    'zoom.exe':             'productivity',
    'skype.exe':            'productivity',
    'chrome.exe':           'productivity',
    'msedge.exe':           'productivity',
    'firefox.exe':          'productivity',
    'brave.exe':            'productivity',
    'opera.exe':            'productivity',
    'explorer.exe':         'productivity',
    'cmd.exe':              'productivity',
    'powershell.exe':       'productivity',
    'windowsterminal.exe':  'productivity',
    'notepad.exe':          'productivity',
    'notepad++.exe':        'productivity',
    'wordpad.exe':          'productivity',
    'acrobat.exe':          'productivity',
    'acrord32.exe':         'productivity',
    'sumatrapdf.exe':       'productivity',
    'thunderbird.exe':      'productivity',
    'msteams.exe':          'productivity',
    'trello.exe':           'productivity',
    'asana.exe':            'productivity',
    'figma.exe':            'productivity',
    'xd.exe':               'productivity',
    'mspaint.exe':          'productivity',
    'paint.net.exe':        'productivity',
    'gimp-2.10.exe':        'productivity',
    'photoshop.exe':        'productivity',
    'calculator.exe':       'productivity',
}

# Process names to ignore (system/lock-screen processes that don't represent real usage)
SKIP_APPS: frozenset[str] = frozenset({
    'logonui.exe',
    'lockapp.exe',
    'screensaverengine.exe',
    'winlogon.exe',
    'dwm.exe',
    'taskbar.exe',
    'searchui.exe',
    'startmenuexperiencehost.exe',
    'textinputhost.exe',
    'systemsettings.exe',
    'applicationframehost.exe',
    'shellexperiencehost.exe',
    'sihost.exe',
    'ctfmon.exe',
    'taskmgr.exe',
    'procexp64.exe',
    'procexp.exe',
    'idle',
    '',
})

_custom: dict[str, str] = {}


def load_custom(path: str = 'categories.json') -> None:
    global _custom
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            raw = json.load(f)
        _custom = {k.lower(): v for k, v in raw.items()}


def categorize(app_name: str) -> str:
    name = app_name.lower()
    return _custom.get(name) or _BUILTIN.get(name) or 'productivity'


def should_skip(app_name: str) -> bool:
    return app_name.lower() in SKIP_APPS
