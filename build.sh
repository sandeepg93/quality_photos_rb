#!/bin/sh
# Rebuild the single-file offline bundle.
python3 "$(dirname "$0")/build.py" "$@"
