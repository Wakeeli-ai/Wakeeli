#!/usr/bin/env python3
"""Generate PDFs from test result text files using reportlab."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT
import os
import re

TRAINING_DIR = "/home/claw/claudeclaw/workspace/Wakeeli/training"

FILES = [
    ("test_results_batch1.txt", "Wakeeli_Test_Round1_Batch1.pdf", "Round 1 - Batch 1: Scenarios 1-10"),
    ("test_results_batch2.txt", "Wakeeli_Test_Round1_Batch2.pdf", "Round 1 - Batch 2: Scenarios 11-20"),
    ("test_results_batch3.txt", "Wakeeli_Test_Round1_Batch3.pdf", "Round 1 - Batch 3: Scenarios 21-30"),
    ("test_round2_batch1.txt", "Wakeeli_Test_Round2_Batch1.pdf", "Round 2 - Batch 1: Scenarios 1-10"),
    ("test_round2_batch2.txt", "Wakeeli_Test_Round2_Batch2.pdf", "Round 2 - Batch 2: Scenarios 11-20"),
    ("test_round2_batch3.txt", "Wakeeli_Test_Round2_Batch3.pdf", "Round 2 - Batch 3: Scenarios 21-30"),
    ("test_round3_batch1.txt", "Wakeeli_Test_Round3_Batch1.pdf", "Round 3 - Batch 1: Scenarios 1-10"),
    ("test_round3_batch2.txt", "Wakeeli_Test_Round3_Batch2.pdf", "Round 3 - Batch 2: Scenarios 11-20"),
    ("test_round3_batch3.txt", "Wakeeli_Test_Round3_Batch3.pdf", "Round 3 - Batch 3: Scenarios 21-30"),
]


def escape_xml(text):
    """Escape XML special characters for reportlab."""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text


def generate_pdf(input_file, output_file, title):
    input_path = os.path.join(TRAINING_DIR, input_file)
    output_path = os.path.join(TRAINING_DIR, output_file)

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=18,
        spaceAfter=20,
        textColor=HexColor("#1a1a1a"),
    )

    header_style = ParagraphStyle(
        "ScenarioHeader",
        parent=styles["Heading2"],
        fontSize=13,
        spaceAfter=8,
        spaceBefore=16,
        textColor=HexColor("#2d5016"),
        borderWidth=1,
        borderColor=HexColor("#2d5016"),
        borderPadding=4,
    )

    lead_style = ParagraphStyle(
        "LeadMsg",
        parent=styles["Normal"],
        fontSize=10,
        leftIndent=20,
        spaceAfter=4,
        textColor=HexColor("#0066cc"),
        fontName="Helvetica-Bold",
    )

    agent_style = ParagraphStyle(
        "AgentMsg",
        parent=styles["Normal"],
        fontSize=10,
        leftIndent=20,
        spaceAfter=4,
        textColor=HexColor("#333333"),
    )

    result_style = ParagraphStyle(
        "ResultLine",
        parent=styles["Normal"],
        fontSize=10,
        leftIndent=10,
        spaceAfter=4,
        textColor=HexColor("#cc6600"),
        fontName="Helvetica-Bold",
    )

    normal_style = ParagraphStyle(
        "NormalText",
        parent=styles["Normal"],
        fontSize=10,
        spaceAfter=4,
        leftIndent=10,
    )

    story = []
    story.append(Paragraph(escape_xml(title), title_style))
    story.append(Paragraph("Wakeeli AI Chatbot Test Results", styles["Normal"]))
    story.append(Spacer(1, 20))

    lines = content.split("\n")
    for line in lines:
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 6))
            continue

        escaped = escape_xml(stripped)

        # Scenario headers
        if re.match(r"^(SCENARIO|Scenario)\s*#?\d+", stripped, re.IGNORECASE) or stripped.startswith("==="):
            story.append(Paragraph(escaped, header_style))
        elif stripped.startswith("---"):
            story.append(Spacer(1, 10))
        elif re.match(r"^(PASS|FAIL|PARTIAL)", stripped, re.IGNORECASE):
            color = "#228B22" if "PASS" in stripped.upper() else "#cc0000" if "FAIL" in stripped.upper() else "#cc6600"
            result_colored = ParagraphStyle("rc", parent=result_style, textColor=HexColor(color))
            story.append(Paragraph(escaped, result_colored))
        elif stripped.startswith("Lead:") or stripped.startswith("User:"):
            story.append(Paragraph(escaped, lead_style))
        elif stripped.startswith("Agent:") or stripped.startswith("Bot:") or stripped.startswith("Karen:"):
            story.append(Paragraph(escaped, agent_style))
        else:
            story.append(Paragraph(escaped, normal_style))

    doc.build(story)
    print(f"Generated: {output_path}")
    return output_path


if __name__ == "__main__":
    for input_f, output_f, title in FILES:
        input_path = os.path.join(TRAINING_DIR, input_f)
        if os.path.exists(input_path):
            generate_pdf(input_f, output_f, title)
        else:
            print(f"Skipping {input_f}: file not found")
