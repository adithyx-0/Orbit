"""Categorizes Windows processes + window titles into Prosit usage categories."""

import json
import os

# ── Title keyword rules (checked first — more specific) ───────────────────────
# Keys are lowercase substrings to match anywhere in the window title.

_TITLE_RULES: list[tuple[str, str]] = [
    # Entertainment
    ('youtube',           'Entertainment'),
    ('netflix',           'Entertainment'),
    ('spotify',           'Entertainment'),
    ('disney+',           'Entertainment'),
    ('hotstar',           'Entertainment'),
    ('prime video',       'Entertainment'),
    ('amazon video',      'Entertainment'),
    ('twitch',            'Entertainment'),
    ('hulu',              'Entertainment'),
    ('zee5',              'Entertainment'),
    ('sonyliv',           'Entertainment'),
    ('apple tv',          'Entertainment'),
    ('crunchyroll',       'Entertainment'),
    ('steam',             'Entertainment'),
    ('epic games',        'Entertainment'),
    ('vlc',               'Entertainment'),

    # Learning / dev
    ('coursera',          'Learning'),
    ('udemy',             'Learning'),
    ('edx',               'Learning'),
    ('pluralsight',       'Learning'),
    ('linkedin learning', 'Learning'),
    ('khan academy',      'Learning'),
    ('freecodecamp',      'Learning'),
    ('leetcode',          'Learning'),
    ('hackerrank',        'Learning'),
    ('stackoverflow',     'Learning'),
    ('mdn web docs',      'Learning'),
    ('github',            'Learning'),
    ('gitlab',            'Learning'),
    ('readthedocs',       'Learning'),
    ('tutorial',          'Learning'),
    ('documentation',     'Learning'),
    ('jupyter',           'Learning'),
    ('colab',             'Learning'),
    ('kaggle',            'Learning'),
    ('replit',            'Learning'),
    ('codepen',           'Learning'),
    ('exercism',          'Learning'),

    # Productivity
    ('gmail',             'Productivity'),
    ('google docs',       'Productivity'),
    ('google sheets',     'Productivity'),
    ('google slides',     'Productivity'),
    ('google drive',      'Productivity'),
    ('google calendar',   'Productivity'),
    ('google meet',       'Productivity'),
    ('notion',            'Productivity'),
    ('trello',            'Productivity'),
    ('jira',              'Productivity'),
    ('linear',            'Productivity'),
    ('asana',             'Productivity'),
    ('figma',             'Productivity'),
    ('canva',             'Productivity'),
    ('microsoft word',    'Productivity'),
    ('microsoft excel',   'Productivity'),
    ('microsoft teams',   'Productivity'),
    ('outlook',           'Productivity'),
    ('slack',             'Productivity'),
    ('zoom',              'Productivity'),
    ('dropbox',           'Productivity'),
    ('onedrive',          'Productivity'),
    ('airtable',          'Productivity'),
    ('monday.com',        'Productivity'),
    ('basecamp',          'Productivity'),
    ('confluence',        'Productivity'),

    # AI Tools
    ('chatgpt',           'Productivity'),
    ('claude',            'Productivity'),
    ('gemini',            'Productivity'),
    ('copilot',           'Productivity'),
    ('midjourney',        'Productivity'),
    ('dall-e',            'Productivity'),
    ('perplexity',        'Productivity'),
    ('mistral',           'Productivity'),
    ('hugging face',      'Productivity'),
]

# ── Process name → category (fallback when title gives no match) ──────────────

_PROCESS_RULES: dict[str, str] = {
    # Learning / dev IDEs
    'code.exe':               'Learning',
    'pycharm64.exe':          'Learning',
    'idea64.exe':             'Learning',
    'webstorm64.exe':         'Learning',
    'datagrip64.exe':         'Learning',
    'rider64.exe':            'Learning',
    'studio64.exe':           'Learning',
    'android studio.exe':     'Learning',
    'clion64.exe':            'Learning',
    'goland64.exe':           'Learning',
    'anaconda-navigator.exe': 'Learning',
    'jupyter.exe':            'Learning',
    'rstudio.exe':            'Learning',
    'matlab.exe':             'Learning',
    'eclipse.exe':            'Learning',
    'devenv.exe':             'Learning',
    'winmerge.exe':           'Learning',
    'sourcetree.exe':         'Learning',
    'postman.exe':            'Learning',
    'insomnia.exe':           'Learning',
    'dbeaver.exe':            'Learning',
    'tableplus.exe':          'Learning',

    # Entertainment
    'vlc.exe':                'Entertainment',
    'spotify.exe':            'Entertainment',
    'steam.exe':              'Entertainment',
    'epicgameslauncher.exe':  'Entertainment',
    'discord.exe':            'Entertainment',
    'obs64.exe':              'Entertainment',
    'mpc-hc64.exe':           'Entertainment',
    'wmplayer.exe':           'Entertainment',
    'itunes.exe':             'Entertainment',
    'foobar2000.exe':         'Entertainment',
    'winamp.exe':             'Entertainment',

    # Productivity (browser / office — refined by title rules above)
    'winword.exe':            'Productivity',
    'excel.exe':              'Productivity',
    'powerpnt.exe':           'Productivity',
    'outlook.exe':            'Productivity',
    'onenote.exe':            'Productivity',
    'teams.exe':              'Productivity',
    'msteams.exe':            'Productivity',
    'slack.exe':              'Productivity',
    'notion.exe':             'Productivity',
    'zoom.exe':               'Productivity',
    'skype.exe':              'Productivity',
    'chrome.exe':             'Productivity',
    'msedge.exe':             'Productivity',
    'firefox.exe':            'Productivity',
    'brave.exe':              'Productivity',
    'opera.exe':              'Productivity',
    'arc.exe':                'Productivity',
    'vivaldi.exe':            'Productivity',
    'explorer.exe':           'Productivity',
    'cmd.exe':                'Productivity',
    'powershell.exe':         'Productivity',
    'windowsterminal.exe':    'Productivity',
    'notepad.exe':            'Productivity',
    'notepad++.exe':          'Productivity',
    'acrobat.exe':            'Productivity',
    'acrord32.exe':           'Productivity',
    'sumatrapdf.exe':         'Productivity',
    'thunderbird.exe':        'Productivity',
    'trello.exe':             'Productivity',
    'asana.exe':              'Productivity',
    'figma.exe':              'Productivity',
    'xd.exe':                 'Productivity',
    'photoshop.exe':          'Productivity',
    'illustrator.exe':        'Productivity',
    'gimp-2.10.exe':          'Productivity',
    'paint.net.exe':          'Productivity',
    'mspaint.exe':            'Productivity',
    'calculator.exe':         'Productivity',
}

# ── Skip list — system/UI processes that are never real usage ─────────────────

_SKIP: frozenset[str] = frozenset({
    'logonui.exe', 'lockapp.exe', 'screensaverengine.exe', 'winlogon.exe',
    'dwm.exe', 'taskbar.exe', 'searchui.exe', 'startmenuexperiencehost.exe',
    'textinputhost.exe', 'systemsettings.exe', 'applicationframehost.exe',
    'shellexperiencehost.exe', 'sihost.exe', 'ctfmon.exe', 'taskmgr.exe',
    'procexp64.exe', 'procexp.exe', 'idle', '',
})

_custom: dict[str, str] = {}


# ── Public API ────────────────────────────────────────────────────────────────

def load_custom(path: str = 'categories.json') -> None:
    global _custom
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            raw = json.load(f)
        _custom = {k.lower(): v for k, v in raw.items()}


def categorize(app_name: str, window_title: str = '') -> str:
    """Return a category string for the given app and window title.

    Priority:
      1. Custom user overrides (categories.json)
      2. Window-title keyword rules  ← NEW: distinguishes YouTube from Gmail in Chrome
      3. Process-name rules
      4. Fallback → 'Productivity'
    """
    name = app_name.lower()

    # 1. User custom overrides
    if name in _custom:
        return _custom[name]

    # 2. Title-based rules (most specific)
    if window_title:
        title_lower = window_title.lower()
        for keyword, category in _TITLE_RULES:
            if keyword in title_lower:
                return category

    # 3. Process-name rules
    if name in _PROCESS_RULES:
        return _PROCESS_RULES[name]

    # 4. Default
    return 'Productivity'


def should_skip(app_name: str) -> bool:
    return app_name.lower() in _SKIP
