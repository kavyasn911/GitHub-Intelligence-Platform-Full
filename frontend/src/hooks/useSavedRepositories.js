import { useLocalStorage } from "./useLocalStorage";

// Saved repositories are stored as a lightweight snapshot (not the full
// enriched payload) — enough to render a card and re-open the source repo.
export function useSavedRepositories() {
  const [saved, setSaved] = useLocalStorage("argus:savedRepos", []);

  function isSaved(fullName) {
    return saved.some((r) => r.full_name === fullName);
  }

  function toggleSave(repository) {
    setSaved((prev) => {
      if (prev.some((r) => r.full_name === repository.full_name)) {
        return prev.filter((r) => r.full_name !== repository.full_name);
      }
      return [
        {
          full_name: repository.full_name,
          name: repository.name,
          description: repository.description,
          html_url: repository.html_url,
          stars: repository.stars,
          language: repository.language,
          savedAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 50);
    });
  }

  return { saved, isSaved, toggleSave };
}
