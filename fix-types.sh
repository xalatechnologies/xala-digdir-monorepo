#!/bin/bash

# Fix Switch components - change onCheckedChange to onChange
find apps/backoffice/src -name "*.tsx" -type f -exec sed -i '' 's/onCheckedChange={(checked: boolean)/onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const checked = e.target.checked;/g' {} \;
find apps/backoffice/src -name "*.tsx" -type f -exec sed -i '' 's/onCheckedChange={(checked)/onChange={(e) => { const checked = e.target.checked; /g' {} \;

echo "Fixed Switch components"

# Fix Spinner in seasons list
sed -i '' 's/<Spinner \/>/<Spinner aria-label="Loading" \/>/g' apps/backoffice/src/routes/seasons/SeasonsListPage.tsx

echo "Fixed Spinner components"

# Fix onClear in seasons
sed -i '' 's/onClear={() => setSearchQuery(.*)}//' apps/backoffice/src/routes/seasons/SeasonsListPage.tsx

echo "Fixed onClear in seasons"

echo "Done!"
