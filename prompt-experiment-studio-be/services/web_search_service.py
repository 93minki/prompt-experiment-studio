from __future__ import annotations
from typing import Any, TypedDict
from ddgs import DDGS

import httpx

TAVILY_SEARCH_URL = "https://api.tavily.com/search"
DUCKDUCKGO_SEARCH_URL = "https://api.duckduckgo.com/"


class WebSearchResult(TypedDict):
    title: str
    url: str
    snippet: str
    source: str


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _extract_ddg_topics(items: list[Any]) -> list[tuple[str, str]]:
    collected: list[tuple[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue

        if "FirstURL" in item and "Text" in item:
            url = _clean_text(item.get("FirstURL"))
            text = _clean_text(item.get("Text"))
            if url and text:
                collected.append((text, url))
            continue

        nested = item.get("Topics")
        if isinstance(nested, list):
            collected.extend(_extract_ddg_topics(nested))
    return collected


def _search_tavily(
    *, query: str, api_key: str, max_results: int
) -> list[WebSearchResult]:
    body = {
        "api_key": api_key,
        "query": query,
        "max_results": max_results,
        "search_depth": "basic",
        "include_answer": False,
        "include_raw_content": False,
    }

    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.post(TAVILY_SEARCH_URL, json=body)
            response.raise_for_status()
            payload = response.json()
    except Exception:
        return []

    raw_results = payload.get("results", [])
    if not isinstance(raw_results, list):
        return []

    results: list[WebSearchResult] = []
    for item in raw_results:
        if not isinstance(item, dict):
            continue

        title = _clean_text(item.get("title")) or "(no title)"
        url = _clean_text(item.get("url"))
        snippet = _clean_text(item.get("content"))

        if not url:
            continue

        results.append(
            {
                "title": title,
                "url": url,
                "snippet": snippet,
                "source": "tavily",
            }
        )
    return results[:max_results]


def _search_duckduckgo(*, query: str, max_results: int) -> list[WebSearchResult]:
    try:
        with DDGS() as ddgs:
            rows = list(
                ddgs.text(
                    query,
                    max_results=max_results,
                    region="wt-wt",
                    safesearch="moderate",
                )
            )
    except Exception:
        return []

    results: list[WebSearchResult] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        title = _clean_text(row.get("title")) or "(no title)"
        url = _clean_text(row.get("href") or row.get("url"))
        snippet = _clean_text(row.get("body") or row.get("snippet"))
        if not url:
            continue
        results.append(
            {
                "title": title,
                "url": url,
                "snippet": snippet,
                "source": "duckduckgo",
            }
        )
    return results[:max_results]


def search_web(
    *,
    query: str,
    tavily_api_key: str | None,
    max_results: int = 5,
) -> list[WebSearchResult]:
    normalized_query = query.strip()
    if not normalized_query:
        return []

    if tavily_api_key:
        tavily_results = _search_tavily(
            query=normalized_query,
            api_key=tavily_api_key,
            max_results=max_results,
        )
        if tavily_results:
            return tavily_results

    return _search_duckduckgo(query=normalized_query, max_results=max_results)
