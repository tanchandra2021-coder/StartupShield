if (response.status === 429) {
  const details = await response.json().catch(() => ({}));

  console.error(
    "Gemini quota details:",
    String(details.error?.message || "No details returned")
      .replaceAll(GEMINI_API_KEY, "[REDACTED]")
  );

  return json(
    {
      error:
        "Google rejected the request because of quota limits. Check the Vercel function logs for the specific limit.",
    },
    429
  );
}

    if (!response.ok) {
      let error =
        "Gemini could not complete the research.";

      if (response.status === 429) {
        error =
          "Gemini quota or rate limit reached. Check AI Studio usage and billing.";
      } else if (response.status === 404) {
        error =
          "The configured Gemini model is unavailable. Set GEMINI_MODEL to a Search-compatible model available to your project.";
      } else if (
        response.status === 400 ||
        response.status === 403
      ) {
        error =
          "Gemini rejected the key, model, or Search access. Check key restrictions, model access, and billing in AI Studio.";
      }

      return json({ error }, 502);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (
      candidate?.finishReason &&
      candidate.finishReason !== "STOP"
    ) {
      return json(
        {
          error:
            "Gemini did not return a complete report. Try a narrower business description.",
        },
        502
      );
    }

    const text = (candidate?.content?.parts || [])
      .filter(
        (part) =>
          !part.thought &&
          typeof part.text === "string"
      )
      .map((part) => part.text)
      .join("");

    const grounding =
      candidate?.groundingMetadata || {};

    const sources = (
      grounding.groundingChunks || []
    ).flatMap((chunk, index) => {
      try {
        const url = new URL(chunk.web?.uri);

        if (url.protocol !== "https:") {
          return [];
        }

        return [
          {
            id: index + 1,
            title: chunk.web.title || url.hostname,
            url: url.href,
          },
        ];
      } catch {
        return [];
      }
    });

    if (
      !text ||
      !sources.length ||
      !grounding.webSearchQueries?.length
    ) {
      return json(
        {
          error:
            "No verified search-grounding metadata was returned. Try a more specific product and location.",
        },
        502
      );
    }

    // Add source numbers using Google's grounding metadata.
    // Grounding offsets use UTF-8 byte positions.
    const bytes = Buffer.from(text, "utf8");
    const marks = new Map();

    const validSourceIds = new Set(
      sources.map((source) => source.id)
    );

    for (
      const support of grounding.groundingSupports || []
    ) {
      const end = support.segment?.endIndex;

      if (
        !Number.isInteger(end) ||
        end < 0 ||
        end > bytes.length
      ) {
        continue;
      }

      const linkedSources = (
        support.groundingChunkIndices || []
      )
        .map((index) => index + 1)
        .filter((id) => validSourceIds.has(id));

      if (linkedSources.length > 0) {
        marks.set(end, [
          ...new Set([
            ...(marks.get(end) || []),
            ...linkedSources,
          ]),
        ]);
      }
    }

    let report = "";
    let start = 0;

    const orderedMarks = [...marks.entries()]
      .sort((a, b) => a[0] - b[0]);

    for (const [end, linkedSources] of orderedMarks) {
      report +=
        bytes.subarray(start, end).toString("utf8") +
        linkedSources
          .map((id) => ` [${id}]`)
          .join("");

      start = end;
    }

    report += bytes.subarray(start).toString("utf8");

    return json({
      report,
      sources,

      searchSuggestions:
        grounding.searchEntryPoint?.renderedContent || "",

      researchedAt: new Date().toISOString(),
    });
  } catch {
    return json(
      {
        error:
          "Research timed out or could not connect. Try a narrower request.",
      },
      503
    );
  }
}
