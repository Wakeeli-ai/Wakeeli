#!/usr/bin/env python3
import json
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT

VERDICTS_R10 = {i: "PASS" for i in range(1, 31)}
VERDICTS_R10[4] = "PARTIAL"

VERDICTS_R11 = {i: "PASS" for i in range(1, 31)}
VERDICTS_R11[4] = "PARTIAL"
VERDICTS_R11[22] = "PARTIAL"

SCENARIO_NAMES = {
    1: "Bare Greeting", 2: "Rent or Buy First", 3: "Name Enforcement",
    4: "Full Happy Path Rent", 5: "Full Happy Path Buy", 6: "LBP Conversion",
    7: "Off Topic", 8: "Bot Identity", 9: "Arabic Greeting",
    10: "Mixed Language", 11: "Rejection First", 12: "Rejection Second",
    13: "Booking Flow", 14: "Same Day Visit", 15: "Reschedule",
    16: "Far Timeline", 17: "Broken Link", 18: "Address Question",
    19: "Photo Question", 20: "Post-Handoff", 21: "Villa Request",
    22: "Drip Input", 23: "All Info One Message", 24: "Budget Refusal",
    25: "Name as Phone", 26: "Returning Lead", 27: "Over Budget",
    28: "Multiple Types", 29: "Correction", 30: "Emoji/Special Chars"
}

def parse_results(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    scenarios = []
    blocks = re.split(r'--- S(\d+):', content)

    for i in range(1, len(blocks), 2):
        num = int(blocks[i])
        text = blocks[i + 1]
        lines = text.strip().split('\n')

        messages = []
        for line in lines:
            line = line.strip()
            if not line or line.startswith('==='):
                continue
            if line.startswith('USER:'):
                messages.append(('USER', line[5:].strip()))
            elif line.startswith('BOT:') or line.startswith('BOT after name:') or line.startswith('BOT first rejection:') or line.startswith('BOT second rejection:'):
                raw = line.split(':', 1)[1].strip()
                try:
                    data = json.loads(raw)
                    bot_text = '\n'.join(data.get('messages', [raw]))
                except:
                    bot_text = raw
                messages.append(('BOT', bot_text))

        scenarios.append((num, messages))

    return scenarios

def make_pdf(input_path, output_path, round_num, verdicts):
    scenarios = parse_results(input_path)

    doc = SimpleDocTemplate(output_path, pagesize=A4,
                           leftMargin=20*mm, rightMargin=20*mm,
                           topMargin=15*mm, bottomMargin=15*mm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=18, spaceAfter=5)
    subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=10, textColor=colors.grey, spaceAfter=15)
    header_style = ParagraphStyle('Header', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#1a1a2e'), spaceBefore=15, spaceAfter=5)
    user_style = ParagraphStyle('User', parent=styles['Normal'], fontSize=9, leftIndent=10, textColor=colors.HexColor('#333333'), spaceAfter=3)
    bot_style = ParagraphStyle('Bot', parent=styles['Normal'], fontSize=9, leftIndent=10, textColor=colors.HexColor('#0066cc'), spaceAfter=3)
    pass_style = ParagraphStyle('Pass', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#2e7d32'), spaceBefore=5, spaceAfter=10)
    partial_style = ParagraphStyle('Partial', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#ef6c00'), spaceBefore=5, spaceAfter=10)
    fail_style = ParagraphStyle('Fail', parent=styles['Normal'], fontSize=10, textColor=colors.red, spaceBefore=5, spaceAfter=10)

    story = []

    pass_count = sum(1 for v in verdicts.values() if v == "PASS")
    partial_count = sum(1 for v in verdicts.values() if v == "PARTIAL")
    fail_count = sum(1 for v in verdicts.values() if v == "FAIL")

    story.append(Paragraph(f'Wakeeli Chatbot Test Results: Round {round_num}', title_style))
    story.append(Paragraph(f'{pass_count} PASS / {partial_count} PARTIAL / {fail_count} FAIL', subtitle_style))
    story.append(Spacer(1, 5*mm))

    for num, messages in scenarios:
        name = SCENARIO_NAMES.get(num, f"Scenario {num}")
        story.append(Paragraph(f'S{num}: {name}', header_style))

        for role, text in messages:
            safe = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')
            if role == 'USER':
                story.append(Paragraph(f'<b>User:</b> {safe}', user_style))
            else:
                story.append(Paragraph(f'<b>Bot:</b> {safe}', bot_style))

        v = verdicts.get(num, "PASS")
        if v == "PASS":
            story.append(Paragraph(f'Verdict: PASS', pass_style))
        elif v == "PARTIAL":
            story.append(Paragraph(f'Verdict: PARTIAL (no inventory match in seed data)', partial_style))
        else:
            story.append(Paragraph(f'Verdict: FAIL', fail_style))

    # Summary table
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Summary', styles['Heading1']))

    table_data = [['#', 'Scenario', 'Result']]
    for i in range(1, 31):
        v = verdicts.get(i, "PASS")
        table_data.append([str(i), SCENARIO_NAMES.get(i, ''), v])

    t = Table(table_data, colWidths=[15*mm, 100*mm, 30*mm])

    row_colors = []
    for i in range(1, 31):
        v = verdicts.get(i, "PASS")
        if v == "PASS":
            row_colors.append(('BACKGROUND', (2, i), (2, i), colors.HexColor('#e8f5e9')))
        elif v == "PARTIAL":
            row_colors.append(('BACKGROUND', (2, i), (2, i), colors.HexColor('#fff3e0')))
        else:
            row_colors.append(('BACKGROUND', (2, i), (2, i), colors.HexColor('#ffebee')))

    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ] + row_colors))

    story.append(t)
    doc.build(story)
    print(f"Generated: {output_path}")

make_pdf(
    '/home/claw/claudeclaw/workspace/Wakeeli/training/test_round10_results.txt',
    '/home/claw/claudeclaw/workspace/Wakeeli/training/Round_10_Results.pdf',
    10, VERDICTS_R10
)

make_pdf(
    '/home/claw/claudeclaw/workspace/Wakeeli/training/test_round11_results.txt',
    '/home/claw/claudeclaw/workspace/Wakeeli/training/Round_11_Results.pdf',
    11, VERDICTS_R11
)
