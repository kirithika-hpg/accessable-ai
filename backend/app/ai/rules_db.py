# Comprehensive WCAG Accessibility Remediation Knowledge Base

RULES_KNOWLEDGE_BASE = {
    "image-alt": {
        "rule_name": "Images must have alternate text",
        "simple_explanation": "Images on the webpage are missing a text description. When an image has no alternate text, people who cannot see the screen have no way of knowing what the image displays or why it is there.",
        "why_it_matters": "Blind users rely on screen reading software which speaks the contents of the page aloud. If an image lacks an 'alt' attribute, the screen reader may either skip it completely or announce the full confusing file URL.",
        "impact_by_disability": {
            "blind": "Screen readers cannot announce image content or purpose, creating severe information barriers.",
            "low_vision": "Users who disable images to conserve bandwidth or reduce glare lose critical visual context.",
            "motor": "Speech-input users cannot target the image via voice commands if it acts as a link.",
            "cognitive": "Users who process text more easily than complex images miss out on the intended information."
        },
        "wcag_reference": {
            "guideline": "Guideline 1.1 Text Alternatives",
            "principle": "Principle 1: Perceivable",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": snippet.replace("<img", '<img alt="Descriptive overview of image subject matter"') if "<img" in snippet and "alt=" not in snippet else '<img src="photo.jpg" alt="Two team members collaborating at work" />',
            "alt_text_suggestion": "Descriptive summary of the visual details and context of this graphic.",
            "css_suggestion": None,
            "explanation_of_fix": "Added an `alt` attribute describing the content and function of the image. For decorative images, use an empty alt attribute `alt=\"\"`.",
            "verification_instructions": "Inspect the rendered HTML in developer tools to ensure the `alt` attribute is present and non-empty."
        }
    },
    "color-contrast": {
        "rule_name": "Elements must have sufficient color contrast",
        "simple_explanation": "The text color is too similar to the background color behind it, making words faint and very difficult or impossible to read.",
        "why_it_matters": "Text with low contrast causes eye strain and prevents users with low vision, color blindness, or age-related visual degradation from reading the website content.",
        "impact_by_disability": {
            "blind": "Indirectly affects users with partial sight who do not use full screen readers.",
            "low_vision": "Words blur into the background, causing severe legibility barriers and eye fatigue.",
            "motor": "No direct motor impediment, but causes navigation delays and errors.",
            "cognitive": "Increases cognitive strain and reduces reading comprehension, especially under bright lighting or mobile sun glare."
        },
        "wcag_reference": {
            "guideline": "Guideline 1.4 Distinguishable",
            "principle": "Principle 1: Perceivable",
            "level": "Level AA (WCAG 2.1 - 4.5:1 minimum ratio)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": snippet.replace("color: #999", "color: #1e293b").replace("color:#999", "color:#1e293b").replace("color: #888", "color: #1e293b"),
            "alt_text_suggestion": None,
            "css_suggestion": "color: #0f172a; /* Provides 16:1 contrast ratio against pure white #ffffff */",
            "explanation_of_fix": "Darkened the foreground text color to #0f172a (or #1e293b), achieving a contrast ratio well above the required 4.5:1 threshold.",
            "verification_instructions": "Verify the revised foreground and background colors using the WebAIM Contrast Checker."
        }
    },
    "label": {
        "rule_name": "Form elements must have labels",
        "simple_explanation": "An input box or form control has no label explaining what information the user needs to type into it.",
        "why_it_matters": "When a screen reader user navigates into an unlabelled input field, the software will announce 'Edit text, blank' without telling the person whether it wants a name, email address, password, or credit card number.",
        "impact_by_disability": {
            "blind": "Users have no idea what information is expected, making form completion impossible without assistance.",
            "low_vision": "Users who zoom in lose peripheral placeholder context when typing.",
            "motor": "Clicking the label expands the touch target area, making it much easier for motor-impaired users to focus the control.",
            "cognitive": "Clear, persistent labels reduce memory load and prevent input errors."
        },
        "wcag_reference": {
            "guideline": "Guideline 1.3 Adaptable & Guideline 4.1 Compatible",
            "principle": "Principle 1: Perceivable & Principle 4: Robust",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": '<label for="field-input" class="form-label">Username:</label>\n' + (snippet.replace("<input", '<input id="field-input" aria-required="true"') if "<input" in snippet else '<input id="field-input" type="text" name="username" aria-required="true"/>'),
            "alt_text_suggestion": None,
            "css_suggestion": ".form-label { display: block; font-weight: 600; margin-bottom: 4px; }",
            "explanation_of_fix": "Added an explicit `<label for=\"...\">` element tied to the `id` of the input, plus `aria-required=\"true\"` where applicable.",
            "verification_instructions": "Click on the visible label text; the browser should immediately focus the associated input field."
        }
    },
    "button-name": {
        "rule_name": "Buttons must have discernible text",
        "simple_explanation": "A clickable button does not have any readable text inside it or an accessible name.",
        "why_it_matters": "Buttons with only icons or blank contents cannot be announced by screen readers, leaving users guessing what the button does.",
        "impact_by_disability": {
            "blind": "Screen readers announce 'Button' with zero indication of whether clicking will search, delete, or submit.",
            "low_vision": "Tiny obscure icons are difficult to interpret without descriptive tooltip or label.",
            "motor": "Speech-recognition users cannot target the button using voice commands like 'click search'.",
            "cognitive": "Icon-only controls increase cognitive burden and cause unintended activations."
        },
        "wcag_reference": {
            "guideline": "Guideline 4.1 Compatible",
            "principle": "Principle 4: Robust",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": snippet.replace("<button", '<button aria-label="Submit Form" title="Submit Form"') if "<button" in snippet else '<button type="submit" aria-label="Submit Form">Submit</button>',
            "alt_text_suggestion": None,
            "css_suggestion": None,
            "explanation_of_fix": "Added `aria-label=\"...\"` or visible inner text so assistive technologies can announce the button's exact purpose.",
            "verification_instructions": "Focus the button using the Tab key; inspect Accessibility tree to confirm the Accessible Name matches."
        }
    },
    "heading-order": {
        "rule_name": "Heading levels should only increase by one",
        "simple_explanation": "Headings on the page skip levels, for instance jumping straight from a main <h1> title to a sub-heading <h4>.",
        "why_it_matters": "Screen readers allow users to skim a page by jumping between heading levels (h1 -> h2 -> h3). Skipping levels makes the structure confusing and suggests content is missing.",
        "impact_by_disability": {
            "blind": "Users build a mental outline of the page using headings; broken hierarchies break mental navigation models.",
            "low_vision": "Visual heading hierarchy helps users orient themselves across zoomed views.",
            "motor": "Headings are standard keyboard navigation milestones for screen reader and switch device users.",
            "cognitive": "Logical outlines improve comprehension and make long articles easier to digest."
        },
        "wcag_reference": {
            "guideline": "Guideline 1.3 Adaptable",
            "principle": "Principle 1: Perceivable",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": snippet.replace("<h4", "<h2").replace("</h4>", "</h2>").replace("<h5", "<h3").replace("</h5>", "</h3>"),
            "alt_text_suggestion": None,
            "css_suggestion": "/* Style h2 visually as needed rather than skipping heading tags */",
            "explanation_of_fix": "Changed heading tag to the next sequential rank (e.g. h1 followed by h2). Use CSS classes to control visual font size instead of skipping HTML heading tags.",
            "verification_instructions": "Use a screen reader heading navigation shortcut (e.g. press 'H' in NVDA) to verify sequential traversal."
        }
    },
    "html-has-lang": {
        "rule_name": "<html> element must have a lang attribute",
        "simple_explanation": "The webpage does not declare what language it is written in (such as English, Spanish, or Hindi).",
        "why_it_matters": "Speech synthesizers and screen readers need to know the document language to select the appropriate pronunciation rules and phonetic dictionary.",
        "impact_by_disability": {
            "blind": "Text will be pronounced with incorrect accent and phonemes, rendering it unintelligible.",
            "low_vision": "Text-to-speech tools used by low-vision users fail pronunciation.",
            "motor": "No direct impact on motor control.",
            "cognitive": "Users relying on translation tools or text-to-speech readers cannot parse words correctly."
        },
        "wcag_reference": {
            "guideline": "Guideline 3.1 Readable",
            "principle": "Principle 3: Understandable",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": '<html lang="en">',
            "alt_text_suggestion": None,
            "css_suggestion": None,
            "explanation_of_fix": "Added `lang=\"en\"` to the root `<html>` tag to declare English as the primary document language.",
            "verification_instructions": "Inspect top of the HTML document to ensure `<html lang=\"en\">` is declared."
        }
    },
    "document-title": {
        "rule_name": "Documents must have <title> element to aid in navigation",
        "simple_explanation": "The webpage is missing a descriptive <title> tag inside the <head> section.",
        "why_it_matters": "The <title> is the very first thing announced when a screen reader loads a page, and is shown on browser tabs and search engine results.",
        "impact_by_disability": {
            "blind": "Users cannot tell which website or section they have opened upon loading the page.",
            "low_vision": "Helps users identify tabs quickly in multi-tab browsing sessions.",
            "motor": "Essential for quick tab switching without having to scroll the DOM.",
            "cognitive": "Clear titles provide immediate situational awareness."
        },
        "wcag_reference": {
            "guideline": "Guideline 2.4 Navigable",
            "principle": "Principle 2: Operable",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": "<title>Page Title – Section or Organization Name</title>",
            "alt_text_suggestion": None,
            "css_suggestion": None,
            "explanation_of_fix": "Added a concise, informative `<title>` element inside the `<head>`.",
            "verification_instructions": "Observe the browser tab label and ensure screen readers announce the title upon navigation."
        }
    },
    "link-name": {
        "rule_name": "Links must have discernible text",
        "simple_explanation": "A hyperlink on the page is empty or only says generic text like 'click here' or 'read more' without explaining where it leads.",
        "why_it_matters": "Screen reader users frequently pull up a list of links to jump through a page. If the links say 'click here', they cannot tell what destination each link opens.",
        "impact_by_disability": {
            "blind": "Screen reader link lists become useless when links lack destination context.",
            "low_vision": "Users magnifying the screen must search surrounding text to determine where the link goes.",
            "motor": "Speech-recognition users cannot easily activate links using unique spoken commands.",
            "cognitive": "Unambiguous link descriptions improve orientation and confidence."
        },
        "wcag_reference": {
            "guideline": "Guideline 2.4 Navigable",
            "principle": "Principle 2: Operable",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": '<a href="/services">Explore our accessible enterprise services</a>',
            "alt_text_suggestion": None,
            "css_suggestion": None,
            "explanation_of_fix": "Replaced generic link text with specific, descriptive destination information.",
            "verification_instructions": "Ensure the link text clearly conveys where the link leads even when read out of context."
        }
    },
    "meta-viewport": {
        "rule_name": "Zooming and scaling must not be disabled",
        "simple_explanation": "The webpage viewport settings forbid users from zooming in, blocking people with low vision from enlarging small text.",
        "why_it_matters": "Users with low vision frequently zoom websites up to 200% or 400% on phones and tablets to read comfortably. Disabling zoom creates a critical accessibility barrier.",
        "impact_by_disability": {
            "blind": "No direct impact on blind users using audio screen readers.",
            "low_vision": "Completely prevents reading text when vision is insufficient for default font sizes.",
            "motor": "Prevents enlarging small interactive buttons for easier tapping.",
            "cognitive": "Zooming helps focus on specific passages without visual distraction."
        },
        "wcag_reference": {
            "guideline": "Guideline 1.4 Distinguishable",
            "principle": "Principle 1: Perceivable",
            "level": "Level AA (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            "alt_text_suggestion": None,
            "css_suggestion": None,
            "explanation_of_fix": "Removed `user-scalable=no` and `maximum-scale=1.0` restrictions to allow pinch-to-zoom.",
            "verification_instructions": "Test zooming the page to 200% on a mobile device or touch screen."
        }
    },
    "skip-link": {
        "rule_name": "Provide a bypass mechanism (Skip to Content)",
        "simple_explanation": "The page has repeated navigation links at the top but does not provide a skip link for keyboard users to jump directly to the main content.",
        "why_it_matters": "Without a skip link, keyboard and screen reader users must press the Tab key dozens of times on every page before reaching the actual article.",
        "impact_by_disability": {
            "blind": "Forces listening to repetitive navigation bars on every single page load.",
            "low_vision": "Helps focused reading without scrolling through expansive headers.",
            "motor": "Prevents repetitive keystrain and frustration for switch and keyboard users.",
            "cognitive": "Direct jump reduces distraction and maintains focus on main content."
        },
        "wcag_reference": {
            "guideline": "Guideline 2.4 Navigable",
            "principle": "Principle 2: Operable",
            "level": "Level A (WCAG 2.1)",
            "url": "https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": '<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>\n<main id="main-content">...</main>',
            "alt_text_suggestion": None,
            "css_suggestion": ".sr-only:focus { position: static; width: auto; height: auto; }",
            "explanation_of_fix": "Added a visible-on-focus skip link linking directly to `<main id=\"main-content\">`.",
            "verification_instructions": "Press Tab immediately after page load and ensure the Skip Link receives focus."
        }
    }
}

def get_rule_knowledge(rule_id: str) -> dict:
    return RULES_KNOWLEDGE_BASE.get(rule_id, {
        "rule_name": f"Accessibility Guideline: {rule_id}",
        "simple_explanation": f"The webpage element failed automated WCAG 2.1 validation for rule '{rule_id}'.",
        "why_it_matters": "Adhering to accessibility standards ensures your content is perceivable, operable, understandable, and robust for everyone.",
        "impact_by_disability": {
            "blind": "May hinder screen reader interpretation or announcement.",
            "low_vision": "May cause visibility or contrast obstacles.",
            "motor": "May restrict keyboard focus or interaction.",
            "cognitive": "May complicate user comprehension."
        },
        "wcag_reference": {
            "guideline": "WCAG 2.1 Success Criteria",
            "principle": "Universal Design Principles",
            "level": "Level AA",
            "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"
        },
        "fix_generator": lambda snippet: {
            "suggested_snippet": snippet or "<!-- Accessible code element -->",
            "alt_text_suggestion": None,
            "css_suggestion": None,
            "explanation_of_fix": "Refactor element to conform to WAI-ARIA and semantic HTML5 standards.",
            "verification_instructions": "Re-run the accessibility audit scanner to confirm violation resolution."
        }
    })
