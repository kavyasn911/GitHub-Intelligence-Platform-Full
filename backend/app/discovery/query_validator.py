import re


class QueryValidator:

    BLOCKLIST = {
        "malware",
        "ransomware",
        "keylogger",
        "credential stealer",
        "steal password",
        "phishing",
        "ddos",
        "botnet",
        "exploit kit",
        "virus",
    }

    MIN_QUERY_LENGTH = 6

    def validate(
        self,
        query: str,
    ) -> dict:

        query = (query or "").strip()

        if not query:
            return {
                "status":"invalid",
                "message":"Please describe what you want to build.",
                "normalized_query":"",
                "searchable_query":"",
            }

        normalized = self._normalize(query)

        if len(normalized) < self.MIN_QUERY_LENGTH:
            return {
                "status":"invalid",
                "message":"Please provide a more detailed software engineering request.",
                "normalized_query":normalized,
                "searchable_query":"",
            }

        for word in self.BLOCKLIST:

            if word in normalized:

                return {
                    "status":"blocked",
                    "message":"Repository discovery is unavailable for this request.",
                    "normalized_query":normalized,
                    "searchable_query":"",
                }

        return {
            "status":"valid",
            "message":"",
            "normalized_query":normalized,
            "searchable_query":normalized,
        }

    def _normalize(
        self,
        text: str,
    ) -> str:

        text = text.lower()

        text = re.sub(
            r"[^a-z0-9+#.-]+",
            " ",
            text,
        )

        return re.sub(
            r"\s+",
            " ",
            text,
        ).strip()
