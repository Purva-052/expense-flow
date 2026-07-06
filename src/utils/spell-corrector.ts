/* eslint-disable @typescript-eslint/no-explicit-any */

const cache = new Map<string, string>();

async function correctSpellingInTextNode(text: string): Promise<string> {
  if (!text || !/[a-zA-Z]/.test(text)) return text;
  
  if (cache.has(text)) {
    return cache.get(text)!;
  }

  try {
    const params = new URLSearchParams();
    params.append("text", text);
    params.append("language", "en-US");

    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) return text;

    const data = await res.json();
    const matches = data.matches || [];

    // Sort matches by offset in descending order so index replacements do not shift offsets
    matches.sort((a: any, b: any) => b.offset - a.offset);

    let correctedText = text;
    for (const match of matches) {
      if (
        (match.shortMessage === "Spelling mistake" ||
          match.rule?.category?.id === "TYPOS" ||
          match.message?.toLowerCase().includes("spelling")) &&
        match.replacements &&
        match.replacements.length > 0
      ) {
        const replacement = match.replacements[0].value;
        const start = match.offset;
        const end = match.offset + match.length;
        correctedText =
          correctedText.substring(0, start) +
          replacement +
          correctedText.substring(end);
      }
    }

    cache.set(text, correctedText);
    return correctedText;
  } catch (e) {
    console.error("LanguageTool correction failed:", e);
    return text;
  }
}

export async function correctSpellingInHtml(htmlString: string): Promise<string> {
  if (typeof window === "undefined" || !htmlString) return htmlString;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Traverse to collect all text nodes
    const textNodes: Node[] = [];
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue && /[a-zA-Z]/.test(node.nodeValue)) {
          textNodes.push(node);
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    };

    walk(doc.body);

    // Correct text nodes concurrently
    await Promise.all(
      textNodes.map(async (node) => {
        if (node.nodeValue) {
          const corrected = await correctSpellingInTextNode(node.nodeValue);
          node.nodeValue = corrected;
        }
      })
    );

    return doc.body.innerHTML;
  } catch (e) {
    console.error("Autocorrect failed:", e);
    return htmlString;
  }
}
