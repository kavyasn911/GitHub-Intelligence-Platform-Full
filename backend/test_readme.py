from backend.app.github.readme import ReadmeFetcher

fetcher = ReadmeFetcher()

text = fetcher.fetch_readme(
    "rohitpranavv/NEXUSOPS"
)

print(text)