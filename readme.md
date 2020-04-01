# readability-scores

Based on wooorm/readibility.
Split out creating grade results for the formulas.

## Related

*   [`automated-readability`](https://github.com/words/automated-readability)
    � Uses character count instead of error-prone syllable parser
*   [`coleman-liau`](https://github.com/words/coleman-liau)
    � Uses letter count instead of an error-prone syllable parser
*   [`dale-chall-formula`](https://github.com/words/dale-chall-formula)
    � Uses a dictionary, suited for higher reading levels
*   [`flesch`](https://github.com/words/flesch)
    � Uses syllable count
*   [`flesch-kincaid`](https://github.com/words/flesch-kincaid)
    � Like `flesch-formula`, returns U.S. grade levels
*   [`gunning-fog`](https://github.com/words/gunning-fog)
    � Uses syllable count, hard to implement with a computer (needs
    POS-tagging and Named Entity Recognition)
*   [`smog-formula`](https://github.com/words/smog-formula)
    � Like `gunning-fog-index`, without needing advanced NLP
*   [`spache-formula`](https://github.com/words/spache-formula)
    � Uses a dictionary, suited for lower reading levels
