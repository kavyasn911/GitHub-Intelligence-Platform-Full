from collections import Counter


class SkillIntelligenceAgent:

    def answer(
        self,
        query: str,
        context: dict,
    ) -> dict:

        repositories = context.get("repositories", [])

        skills = []

        for repository in repositories:
            skills.extend(repository.get("skills", []))

        counts = Counter(skills)

        ranked_skills = [
            {
                "skill": skill,
                "repository_count": count,
            }
            for skill, count in counts.most_common()
        ]

        if not ranked_skills:
            answer = "No skill evidence is available."
        else:
            answer = (
                f"The strongest detected skill is "
                f"{ranked_skills[0]['skill']}, appearing across "
                f"{ranked_skills[0]['repository_count']} retrieved repositories."
            )

        return {
            "answer": answer,
            "skills": ranked_skills,
            "repositories_analyzed": len(repositories),
        }
