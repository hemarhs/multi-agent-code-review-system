from app.schemas.finding import Finding


class SynthesisAgent:

    def synthesize(
        self,
        findings: list[Finding]
    ) -> list[Finding]:

        unique_findings = {}

        for finding in findings:

            key = (
                finding.title,
                finding.severity
            )

            if key not in unique_findings:
                unique_findings[key] = finding

        result = list(unique_findings.values())

        severity_order = {
            "HIGH": 3,
            "MEDIUM": 2,
            "LOW": 1
        }

        result.sort(
            key=lambda x: severity_order.get(
                x.severity,
                0
            ),
            reverse=True
        )

        return result