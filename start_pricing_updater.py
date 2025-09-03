#!/usr/bin/env python3
"""
Startup script for GCP Pricing Updater
Run this to start the automated pricing data updates
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.pricing_updater import main

if __name__ == "__main__":
    main()