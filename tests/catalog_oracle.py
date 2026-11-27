"""Oráculo independente: python-chess; nenhum PGN ou arquivo privado."""
import json, re, pathlib, sys
try:
    import chess
except ImportError:
    sys.path.insert(0, str(pathlib.Path('..') / 'accuracy_c_v04_isolated' / 'dependencies'))
    import chess
text = pathlib.Path('index.html').read_text(encoding='utf-8')
puzzles = json.loads(re.search(r'const DATA=(.*);\n', text)[1])['puzzles']
for p in puzzles:
    board = chess.Board(p['fen'])
    assert board.is_valid(), p['id']
    assert chess.Move.from_uci(p['melhor_uci']) in board.legal_moves, p['id']
print(f'PASS: {len(puzzles)}/240 FENs válidas e sugestões legais; python-chess {chess.__version__}')
