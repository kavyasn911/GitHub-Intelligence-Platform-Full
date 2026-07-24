from pathlib import Path


class ComponentDetector:

    COMPONENT_FOLDERS = {
        "components": "UI Component",
        "pages": "Page",
        "views": "View",
        "hooks": "Hook",
        "services": "Service",
        "controllers": "Controller",
        "routes": "Route",
        "routers": "Router",
        "models": "Model",
        "entities": "Entity",
        "repositories": "Repository",
        "utils": "Utility",
        "helpers": "Helper",
        "middleware": "Middleware",
        "api": "API",
        "config": "Configuration",
        "schemas": "Schema",
    }

    def detect(self, classified_files: dict):

        components = []

        for file in classified_files["files"]:

            path = Path(file["path"])

            component_type = None

            for part in path.parts:
                key = part.lower()
                if key in self.COMPONENT_FOLDERS:
                    component_type = self.COMPONENT_FOLDERS[key]
                    break

            if component_type is None:
                continue

            components.append({
                "name": path.stem,
                "type": component_type,
                "path": file["path"],
                "category": file["category"],
            })

        summary = {}

        for component in components:
            summary[component["type"]] = summary.get(component["type"], 0) + 1

        return {
            "repository": classified_files["repository"],
            "components": components,
            "summary": summary,
            "total_components": len(components),
        }
