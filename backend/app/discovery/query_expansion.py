
import re


class QueryExpansionEngine:

    EXACT_TERMS = {
        "openclaw": [
            ("openclaw",10),
            ("openclaw agent",10),
            ("open claw",9),
            ("open claw agent",9),
            ("hermes agent",6),
            ("ai agent",4),
            ("agent framework",4),
        ],

        "kubernetes":[
            ("kubernetes",10),
            ("kubernetes operator",10),
            ("operator sdk",8),
            ("controller-runtime",7),
        ],

        "inventory":[
            ("inventory management",10),
            ("warehouse management",8),
            ("stock management",8),
            ("erp",5),
        ],
    }


    def expand(self,query:str):

        q=self._normalize(query)

        weighted=[]

        weighted.append({
            "query":q,
            "weight":10,
        })

        for keyword,items in self.EXACT_TERMS.items():

            if keyword in q:

                for value,weight in items:

                    weighted.append({
                        "query":value,
                        "weight":weight,
                    })

        unique={}

        for item in sorted(
            weighted,
            key=lambda x:x["weight"],
            reverse=True,
        ):

            if item["query"] not in unique:
                unique[item["query"]]=item

        return list(unique.values())


    def _normalize(self,text):

        text=str(text).lower()

        text=re.sub(
            r"[^a-z0-9+#.-]+",
            " ",
            text,
        )

        return re.sub(
            r"\s+",
            " ",
            text,
        ).strip()
