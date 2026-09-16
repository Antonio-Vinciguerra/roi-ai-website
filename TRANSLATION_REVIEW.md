# Heading South — language editions

## Release scope

English (reference and fallback), Italian, French, Spanish and Brazilian Portuguese (`pt-BR`). All Portuguese browser variants currently select the Brazilian edition. French and Spanish are shared editions, not separate country-localized versions. No location lookup, IP service, translation API, cookies or live translation requests are used. A manual choice is stored locally when storage is available.

Complete static editions include the homepage, eight service/sector pages, legacy directory and error page, metadata, image descriptions, accessibility labels, interactive examples, guided advisor interface and sample replies. The existing demo remains bounded and is not a live AI consultant. Speech recognition and speech output request the selected language; actual voice support depends on the browser and installed voices.

## Language precedence

1. An explicit edition URL is respected, including externally shared links.
2. On a neutral URL, a valid remembered manual choice takes precedence.
3. Otherwise use the first supported entry in the browser's ordered language preferences, matching regional variants to the supported language.
4. If there is no supported match, keep English.

The small header selector remembers the manual choice and preserves the current page, query parameters and fragment. “Use browser language” clears the override. Explicit language links work without JavaScript; automatic detection needs JavaScript. No body text is translated after rendering: neutral routes resolve to a saved edition in the document head.

## Editorial standard and approval status

Translations are AI-authored editorial drafts with source-by-source coverage and terminology checks. **They are not certified or approved by an independent native-speaking editor.** Automated tests cannot certify tone, idiom or commercial nuance. Antonio should review Italian; native-speaking business editors should approve French, Spanish and Brazilian Portuguese before these are described as professionally validated editions. A future copy change must update the catalogue, not silently fall back to English.

Review in particular: the hero promise; the distinction between evidence and guaranteed results; references to ROI, value creation and investment; regional vocabulary; and all demo limitations. Confirm no translation turns an illustrative scenario into a client case study or a promise of performance.

## Terminology

| English | Italian | French | Spanish | Brazilian Portuguese |
|---|---|---|---|---|
| Measurable growth | Crescita misurabile | Croissance mesurable | Crecimiento medible | Crescimento mensurável |
| ROI | ROI | ROI | ROI | ROI |
| Artificial intelligence | Intelligenza artificiale / AI | Intelligence artificielle / IA | Inteligencia artificial / IA | Inteligência artificial / IA |
| Evidence | Evidenze | Preuves / éléments probants, according to context | Evidencias | Evidências |
| Team | Team | Équipe | Equipo | Equipe |
| Supply chain | Filiera / supply chain, according to context | Chaîne d’approvisionnement | Cadena de suministro | Cadeia de suprimentos |

Heading South is a brand name and is never translated. Headline line breaks and emphasis are retained; Italian and French elided articles stay with the following noun. The established hero and scroll animation clocks are unchanged. Shared images and fonts are reused, not downloaded once per language.

## Verification completed

- Complete catalogue coverage in all five editions; 525 source messages, with repeated titles and labels assembled consistently.
- All language routes and local assets resolve, including fragments.
- Generated JavaScript parses; localized example data and common advisor prompts return the expected language.
- Browser-preference matching, Portuguese regional matching, English fallback, stored overrides, blocked storage, explicit edition URLs, clean Sites paths and GitHub Pages base paths are covered by automated checks.
- Responsive selector styles and translated typography constraints are supplied. No physical-device or browser visual QA was requested or performed for this release; that review remains separate from the automated checks above.

## Maintaining translations

`i18n/messages.json` contains stable English source IDs. `i18n/translations.mjs` has Italian, French, Spanish and Brazilian Portuguese columns. `i18n/catalogue.mjs` composes repeated labels. The build fails for missing page text. Localized scripts are generated from the same source, with unchanged control logic and translated authored literals; no translation engine runs in the visitor's browser.
