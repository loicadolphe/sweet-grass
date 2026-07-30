#!/usr/bin/env bash
# Exercises the full plants/readings flow against a deployed (or local) API.
# Usage: API_URL=https://sweet-grass-api.vercel.app API_KEY=... ./scripts/smoke-test.sh
set -euo pipefail

API_URL="${API_URL:?Set API_URL, e.g. https://sweet-grass-api.vercel.app}"
API_KEY="${API_KEY:?Set API_KEY to your API_SECRET value}"

curl_json() {
  curl -sS -H "x-api-key: $API_KEY" -H "Content-Type: application/json" "$@"
}

echo "== health =="
curl -sS "$API_URL/api/health"
echo

echo "== create plant =="
PLANT=$(curl_json -X POST "$API_URL/api/plants" -d '{
  "nickname": "Smoke Test Plant",
  "species": "Test Species",
  "wateringMethod": "top",
  "moistureMin": 3,
  "moistureMax": 7
}')
echo "$PLANT"
PLANT_ID=$(echo "$PLANT" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Created plant id=$PLANT_ID"
echo

echo "== log a dry reading (expect a water/soak/shower recommendation) =="
curl_json -X POST "$API_URL/api/plants/$PLANT_ID/readings" -d '{"moistureValue": 1}'
echo

echo "== log an in-range reading (expect no action) =="
curl_json -X POST "$API_URL/api/plants/$PLANT_ID/readings" -d '{"moistureValue": 5}'
echo

echo "== clean up =="
curl -sS -o /dev/null -w "DELETE status: %{http_code}\n" -X DELETE -H "x-api-key: $API_KEY" "$API_URL/api/plants/$PLANT_ID"

echo "Smoke test done."
