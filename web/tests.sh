#!/bin/bash

# List of URLs to test (hardcoded)
URLs=(
    "http://localhost:5173/unidades-curriculares"
    "http://localhost:5173/alunos/:id"
    "http://localhost:5173/unidades-curriculares/:id"
    "http://localhost:5173/conflitos"
    "http://localhost:5173/pedidos"
    "http://localhost:5173/pedidos/novo"
    "http://localhost:5173/pedidos/:id"
    "http://localhost:5173/alocacao-manual"

)

# Output file for merged report
output_file="./relatorios/merged-report.html"

# Make sure the output directory exists
mkdir -p "$(dirname "$output_file")"

# Start the HTML structure for the merged report
echo "<!DOCTYPE html>" >"$output_file"
echo "<html lang='en'>" >>"$output_file"
echo "<head>" >>"$output_file"
echo "<meta charset='UTF-8'>" >>"$output_file"
echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" >>"$output_file"
echo "<title>Pa11y Accessibility Reports</title>" >>"$output_file"
echo "<style>" >>"$output_file"
echo "  body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }" >>"$output_file"
echo "  h1 { text-align: center; color: #333; padding: 10px 0; font-size: 28px; margin: 0; background-color: #e8e8e8; }" >>"$output_file"
echo "  h2 { font-size: 22px; color: #444; margin-top: 20px; padding-left: 10px; font-weight: bold; }" >>"$output_file"
echo "  .url-report { background-color: #fff; margin: 10px 0; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }" >>"$output_file"
echo "  pre { background-color: #f7f7f7; border: 1px solid #ddd; padding: 10px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }" >>"$output_file"
echo "  .report-footer { text-align: center; margin-top: 40px; font-size: 14px; color: #888; padding-bottom: 20px; }" >>"$output_file"
echo "</style>" >>"$output_file"
echo "</head>" >>"$output_file"
echo "<body>" >>"$output_file"
echo "<h1>Pa11y Accessibility Reports</h1>" >>"$output_file"
echo "<p style='text-align: center;'>Generated on $(date)</p>" >>"$output_file"

# Loop through each URL and run Pa11y, then append the result to the merged report
for url in "${URLs[@]}"; do
    # Improved message with more information and a friendly tone
    echo "🚀 Starting accessibility test for the page: $url"

    # Run Pa11y for the URL and generate the report in HTML format
    report=$(npx pa11y "$url" --reporter html)

    # Append the URL and report to the merged report file
    echo "<div class='url-report'>" >>"$output_file"
    echo "<h2>Accessibility Report for <span style='color: #1E88E5;'>$url</span></h2>" >>"$output_file"
    echo "<pre>$report</pre>" >>"$output_file"
    echo "</div>" >>"$output_file"
done


# End the HTML structure with footer
echo "<div class='report-footer'>" >>"$output_file"
echo "<p>End of report.</p>" >>"$output_file"
echo "</div>" >>"$output_file"

echo "</body>" >>"$output_file"
echo "</html>" >>"$output_file"

# Print a message indicating the report is complete
echo "🎉 Merged report has been generated: $output_file"

# Open the HTML report in the default browser (this works on Linux, macOS, and Windows)
if which xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "$output_file"
elif which open >/dev/null 2>&1; then
    # macOS
    open "$output_file"
elif which start >/dev/null 2>&1; then
    # Windows
    start "$output_file"
else
    echo "Unable to open the report automatically. Please open it manually from: $output_file"
fi