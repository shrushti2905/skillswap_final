#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
# Skip migrations for now to test
# python manage.py migrate
