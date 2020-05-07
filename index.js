'use strict'

module.exports = readabilityScores

var unified = require('unified')
var english = require('retext-english')
var visit = require('unist-util-visit')
var toString = require('nlcst-to-string')
var normalize = require('nlcst-normalize')
var syllable = require('syllable')
var spache = require('spache')
var daleChall = require('dale-chall')
var daleChallFormula = require('dale-chall-formula')
var ari = require('automated-readability')
var colemanLiau = require('coleman-liau')
// Var flesch = require('flesch')
var smog = require('smog-formula')
var gunningFog = require('gunning-fog')
var spacheFormula = require('spache-formula')
var stemmer = require('stemmer')

var min = Math.min
var round = Math.round

var spacheStems
var daleChallStems

function populateSpacheStems() {
	if (spacheStems === undefined) {
		spacheStems = {}
		let w
		let s
		for (let i = 0; i < spache.length; ++i) {
			w = spache[i]
			if (w.indexOf("'") < 0) {
				s = stemmer(w)
				spacheStems[s] = true
			}
		}
	}
}

function populateDaleChallStems() {
	if (daleChallStems === undefined) {
		daleChallStems = {}
		let w
		let s
		for (let i = 0; i < daleChall.length; ++i) {
			w = daleChall[i]
			if (w.indexOf("'") < 0) {
				s = stemmer(w)
				daleChallStems[s] = true
			}
		}
	}
}

function roundTo2Decimals(n) {
	return round((n + Number.EPSILON) * 100) / 100
}

// Flesch returns reading ease, whereas fleschKincaid returns grade level
function fleschKincaid(counts) {
	return (
		0.39 * (counts.word / counts.sentence) +
		11.8 * (counts.syllable / counts.word) -
		15.59
	)
}

var processor = unified().use(english)

/*
Default Config:

--set to true if you want the results to include all unfamiliar/difficult/polysyllabic words
difficultWords = false

--set to true if you want any words where the first letter is a capital to be treated as a recognized proper noun
--for example, if the first word of the sentence is capitalized, it will be treated as familiar regardless of its difficulty
capsAsNames = false

--use only one of these to exclude all others:
onlySpache = false
onlyDaleChall = false
onlyARI = false
onlyColemanLiau = false
onlyFleschKincaid = false
onlySMOG = false
onlyGunningFog = false

--or any of these to exclude one at a time:
--Spache is excluded by default as Dale-Chall is better for anything 4th grade or higher.
skipDaleChall = false
skipARI = false
skipColemanLiau = false
skipFleschKincaid = false
skipSMOG = false
skipGunningFog = false
*/
function readabilityScores(value, config) {
	if (value) {
		config = processConfig(config)

		var tree = processor.runSync(processor.parse(value))
		if (config.bSpache) {
			populateSpacheStems()
		}

		if (config.bDaleChall) {
			populateDaleChallStems()
		}

		return calcScores(tree, config)
	}
}

function processConfig(config) {
	var c = {}
	var bNotOnly = true
	if (config) {
		bNotOnly = false
		if (config.difficultWords) {
			c.bDifficultWords = true
		}

		if (config.capsAsNames) {
			c.bCapsAsNames = true
		}

		if (config.onlySpache) {
			c.bSpache = true
		} else if (config.onlyDaleChall) {
			c.bDaleChall = true
		} else if (config.onlyARI) {
			c.bARI = true
		} else if (config.onlyColemanLiau) {
			c.bColemanLiau = true
		} else if (config.onlyFleschKincaid) {
			c.bFleschKincaid = true
		} else if (config.onlySMOG) {
			c.bSMOG = true
		} else if (config.onlyGunningFog) {
			c.bGunningFog = true
		} else {
			bNotOnly = true
		}
	}

	if (bNotOnly) {
		c.bDaleChall = !config || !config.skipDaleChall
		c.bARI = !config || !config.skipARI
		c.bColemanLiau = !config || !config.skipColemanLiau
		c.bFleschKincaid = !config || !config.skipFleschKincaid
		c.bSMOG = !config || !config.skipSMOG
		c.bGunningFog = !config || !config.skipGunningFog
		c.bSpache = false
	}

	return c
}

function calcScores(tree, config) {
	var spacheUniqueUnfamiliarWords = []
	var daleChallDifficultWords = []
	var polysyllabicWords = []
	var complexPolysyllabicWord = 0
	var polysyllabicWord = 0
	var syllableCount = 0
	var wordCount = 0
	var letters = 0
	var sentenceCount = 0
	var counts
	var results

	visit(tree, 'SentenceNode', sentence)
	visit(tree, 'WordNode', word)

	// Counts are used in calls to scores
	counts = {
		complexPolysillabicWord: complexPolysyllabicWord,
		polysillabicWord: polysyllabicWord,
		unfamiliarWord: spacheUniqueUnfamiliarWords.length,
		difficultWord: daleChallDifficultWords.length,
		syllable: syllableCount,
		sentence: sentenceCount,
		word: wordCount,
		character: letters,
		letter: letters
	}
	// Results are returned to the user
	results = {
		letterCount: letters,
		syllableCount: syllableCount,
		wordCount: wordCount,
		sentenceCount: sentenceCount,
		polysyllabicWordCount: complexPolysyllabicWord
	}
	if (config.bDifficultWords) {
		results.polysyllabicWords = polysyllabicWords
	}

	if (config.bSpache) {
		results.spacheUniqueUnfamiliarWordCount =
			spacheUniqueUnfamiliarWords.length
		if (config.bDifficultWords) {
			results.spacheUniqueUnfamiliarWords = spacheUniqueUnfamiliarWords
		}

		results.spache = roundTo2Decimals(spacheFormula(counts))
	}

	if (config.bDaleChall) {
		results.daleChallDifficultWordCount = daleChallDifficultWords.length
		if (config.bDifficultWords) {
			results.daleChallDifficultWords = daleChallDifficultWords
		}

		results.daleChall = min(
			17,
			daleChallFormula.gradeLevel(daleChallFormula(counts))[1]
		)
	}

	if (config.bARI) {
		results.ari = roundTo2Decimals(ari(counts))
	}

	if (config.bColemanLiau) {
		results.colemanLiau = roundTo2Decimals(colemanLiau(counts))
	}

	if (config.bFleschKincaid) {
		results.fleschKincaid = roundTo2Decimals(fleschKincaid(counts))
	}

	if (config.bSMOG) {
		results.smog = roundTo2Decimals(smog(counts))
	}

	if (config.bGunningFog) {
		results.gunningFog = roundTo2Decimals(gunningFog(counts))
	}

	return results

	function sentence() {
		sentenceCount++
	}

	function word(node) {
		const value = toString(node)
		const syllables = syllable(value)
		const normalized = normalize(node, {allowApostrophes: true})
		const reCap = /^[A-Z]/
		const bInitCapAsName = config.bCapsAsNames && value.match(reCap)

		wordCount++
		syllableCount += syllables
		letters += value.length

		// Count complex words for smog and gunning-fog based on whether they have 3+ syllables.
		if (syllables >= 3) {
			polysyllabicWord++

			if (!bInitCapAsName) {
				complexPolysyllabicWord++
				if (config.bDifficultWords) {
					polysyllabicWords.push(value)
				}
			}
		}

		if (config.bSpache) {
			// Find unique unfamiliar words for Spache.

			// Spache suffixes per https://readabilityformulas.com/spache-readability-formula.php
			const reSuffixes = /(s|ing|ed)$/

			if (
				bInitCapAsName ||
				spache.indexOf(normalized) > -1 ||
				(normalized.match(reSuffixes) &&
					spacheStems[stemmer(normalized)])
			) {
				// Spache familiar word
			} else if (spacheUniqueUnfamiliarWords.indexOf(value) < 0) {
				spacheUniqueUnfamiliarWords.push(value)
			}
		}

		if (config.bDaleChall) {
			// Find unique difficult words for Dale-Chall.
			// TODO: any hyphenated words where both parts are familiar would also be familiar, like battle-field.

			const reNumber = /^[1-9]\d{0,2}(,?\d{3})*$/

			// This does a much better job than https://readabilityformulas.com/dalechallformula/dale-chall-formula.php
			// Tested on the Gettysburg address, this found plenty more that should be unfamiliar, without a bunch of other false positives for endings like "ing" and "ly"

			if (
				bInitCapAsName ||
				daleChall.indexOf(normalized) > -1 ||
				normalized.match(reNumber) ||
				testDaleChallSuffixes(normalized)
			) {
				// Dale Chall familiar word
			} else {
				daleChallDifficultWords.push(value)
			}
		}
	}

	function testDaleChallSuffixes(normalized) {
		// Dale-Chall suffixes per http://www.lefthandlogic.com/htmdocs/tools/okapi/okapimanual/dale_challWorksheet.PDF
		//	 ['s', 'ies', 'ing', 'n', 'ed', 'ied', 'ly', 'er', 'ier', 'est', 'iest']
		// As "lively" is in the list, "livelier" and "liveliest" should pass due to "ier" and "iest" being valid suffixes.
		// But although "prick" is in the list, "prickly" is not. "Prickly" would be a valid base+suffix, but "pricklier" and "prickliest" should not be valid.
		const reSuffixes = /(s|ing|n|ed|ly|er|est)$/
		const reRemovableSuffixes = /(n|ly|(l?i)?er|(l?i)?est)$/
		const reComboRemoveableSuffixes = /(lier|liest)$/

		if (
			normalized.match(reSuffixes) &&
			daleChallStems[stemmer(normalized.replace(reRemovableSuffixes, ''))]
		) {
			const normLY = normalized.replace(reComboRemoveableSuffixes, 'ly')
			return normalized === normLY || daleChall.indexOf(normLY) > -1
			// If normalized === normLY, then normalized does not end in lier/liest, so is already a valid base+suffix
			// If normalized is one of "livelier" or "liveliest", normLY would be "lively", which is in daleChall so returns true
			// if normalized is one of "pricklier" or "prickliest", normLY would be "prickly", which is NOT in daleChall so returns false
		}

		return false
	}
}
