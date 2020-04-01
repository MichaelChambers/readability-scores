'use strict'

var test = require('tape')
var readabilityScores = require('.')

test('readabilityScores', function(t) {
	var s
	var results

	t.equal(readabilityScores(), undefined, 'Undefined when no value is given')

	// Dr Seuss, The Cat in the Hat
	// Sally, things, and asked are not on the Spache list. All 3 should be allowed as familiar though, per the first name and allowed suffixes rules. But the current code does not recognize first names.
	s =
		'Then our mother came in And she said to us two, “Did you have any fun? Tell me. What did you do?” And Sally and I did not know what to say. Should we tell her The things that went on there that day? Well… what would YOU do If your mother asked you? The Cat in the Hat Look at me! Look at me! Look at me NOW! It is fun to have fun But you have to know how.'
	results = readabilityScores(s, {onlySpache: true, difficultWords: true})
	t.equal(
		results.spacheUniqueUnfamiliarWordCount,
		1,
		'Although "asked" and "things" are not on the Spache white list, they are counted as familiar because they are approved suffixes on the base words "ask" and "thing" which are on the white list.'
	)
	t.equal(
		results.spacheUniqueUnfamiliarWords[0],
		'Sally',
		'Sally is not recognized.'
	)
	t.ok(results.spache > 1.7 && results.spache < 1.8, 'Spache should be 1.74')
	s =
		'With CapsAsNames, not only Sally but all Capitalized Substantially Difficult Words are Dangerously all TREATED as FAMILIAR!'
	results = readabilityScores(s, {onlySpache: true, capsAsNames: true})
	t.equal(
		results.spacheUniqueUnfamiliarWordCount,
		0,
		'Capitalized words as Names may be too dangerous to use.'
	)
	t.equal(
		results.spacheUniqueUnfamiliarWords,
		undefined,
		'DifficultWords config not used.'
	)

	// Dale Chall Endings for Stemmer = /(s|ing|n|ed|ly|er|est)$/
	// None of these are in the Dale Chall original list. All must use stemming. Note that the stem may not be a word: Liberties stem is liberti, which is why we stem the original list too.
	// As "lively" is in the list, "liveliest" should pass due to iest being a valid suffix.
	// But although "prick" is in the list, "prickly" is not. "Prickly" would be a valid base+suffix, but perhaps "prickliest" should not be valid.
	s =
		'Rights, Liberties rolling proven praised rested properly higher longest liveliest prickliest'
	results = readabilityScores(s, {onlyDaleChall: true})
	t.equal(
		results.daleChallDifficultWordCount,
		0,
		'All Dale-Chall base words plus the allowed suffixes should be counted as familiar/easy.'
	)
	t.equal(
		results.daleChall,
		4,
		'If all words are on the white list (or are suffixed versions), return the minimum Dale-Chall score of 4 meaning readable by a 4th grader.'
	)
	t.equal(
		results.daleChallDifficultWords,
		undefined,
		'DifficultWords config not used.'
	)
	t.equal(
		results.polysyllabicWords,
		undefined,
		'DifficultWords config not used.'
	)

	// http://www.abrahamlincolnonline.org/lincoln/speeches/gettysburg.htm
	s =
		'Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. But, in a larger sense, we can not dedicate -- we can not consecrate -- we can not hallow -- this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us -- that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion -- that we here highly resolve that these dead shall not have died in vain -- that this nation, under God, shall have a new birth of freedom -- and that government of the people, by the people, for the people, shall not perish from the earth.'
	results = readabilityScores(s, {difficultWords: true})
	t.equal(
		results.daleChallDifficultWordCount,
		38,
		'There are 38 words that are difficult for a 4th grader.'
	)
	t.ok(
		results.daleChallDifficultWords.includes('perish'),
		'Perish is one of the difficult words for a 4th grader.'
	)
	t.equal(
		results.polysyllabicWordCount,
		20,
		'There are 20 words with 3 or more syllables.'
	)
	t.ok(
		results.polysyllabicWords.includes('remember'),
		'Remember is one of the words with 3 or more syllables.'
	)
	t.equal(
		results.daleChall,
		10,
		'Dale-Chall: Gettysburg Address is readable by 10th graders. On the low side?'
	)
	t.equal(
		results.ari,
		12.11,
		'Automated Readability Index: Gettysburg Address is readable by 12th graders. On the high side?'
	)
	t.equal(
		results.colemanLiau,
		8.06,
		'Coleman-Liau: Gettysburg Address is supposedly readable by 8th graders. Too low!'
	)
	t.equal(
		results.fleschKincaid,
		11,
		'Flesch-Kincaid: Gettysburg Address is readable by 11th graders. Average score.'
	)
	t.equal(
		results.smog,
		11.21,
		'SMOG: Gettysburg Address is readable by 11th graders. Average score.'
	)
	t.equal(
		results.gunningFog,
		13.79,
		'Gunning-Fog: Gettysburg Address is readable by college sophomores. Too high?'
	)

	// Test Config:

	results = readabilityScores('test')
	spacheDoesNotExist()
	daleChallExists()
	ariExists()
	colemanLiauExists()
	fleschKincaidExists()
	smogExists()
	gunningFogExists()

	results = readabilityScores('test', {
		skipDaleChall: true,
		skipARI: true,
		skipColemanLiau: true
	})
	spacheDoesNotExist()
	daleChallDoesNotExist()
	ariDoesNotExist()
	colemanLiauDoesNotExist()
	fleschKincaidExists()
	smogExists()
	gunningFogExists()

	results = readabilityScores('test', {
		skipFleschKincaid: true,
		skipSMOG: true,
		skipGunningFog: true
	})
	spacheDoesNotExist()
	daleChallExists()
	ariExists()
	colemanLiauExists()
	fleschKincaidDoesNotExist()
	smogDoesNotExist()
	gunningFogDoesNotExist()

	results = readabilityScores('test', {onlySpache: true})
	spacheExists()

	results = readabilityScores('test', {onlyDaleChall: true})
	gunningFogDoesNotExist()
	daleChallExists()
	t.equals(
		results.daleChallDifficultWords,
		undefined,
		'Without DifficultWords in config, words are not returned.'
	)

	results = readabilityScores('test', {onlyARI: true})
	daleChallDoesNotExist()
	ariExists()

	results = readabilityScores('test', {onlyColemanLiau: true})
	ariDoesNotExist()
	colemanLiauExists()

	results = readabilityScores('test', {onlyFleschKincaid: true})
	colemanLiauDoesNotExist()
	fleschKincaidExists()

	results = readabilityScores('test', {onlySMOG: true})
	fleschKincaidDoesNotExist()
	smogExists()

	results = readabilityScores('test', {onlyGunningFog: true})
	smogDoesNotExist()
	gunningFogExists()

	t.end()

	function spacheExists() {
		t.ok(results.spache > 0, 'Spache exists.')
	}

	function daleChallExists() {
		t.ok(results.daleChall > 0, 'Dale-Chall exists.')
	}

	function ariExists() {
		t.ok(results.ari > -5, 'ARI exists.')
	}

	function colemanLiauExists() {
		t.ok(results.colemanLiau > -25, 'Coleman-Liau exists.')
	}

	function fleschKincaidExists() {
		t.ok(results.fleschKincaid > -5, 'Flesch-Kincaid exists.')
	}

	function smogExists() {
		t.ok(results.smog > 0, 'SMOG exists.')
	}

	function gunningFogExists() {
		t.ok(results.gunningFog > 0, 'Gunning-Fog exists.')
	}

	function spacheDoesNotExist() {
		t.equals(results.spache, undefined, 'Spache does not exist.')
	}

	function daleChallDoesNotExist() {
		t.equals(results.daleChall, undefined, 'Dale-Chall does not exist.')
	}

	function ariDoesNotExist() {
		t.equals(results.ari, undefined, 'ARI does not exist.')
	}

	function colemanLiauDoesNotExist() {
		t.equals(results.colemanLiau, undefined, 'Coleman-Liau does not exist.')
	}

	function fleschKincaidDoesNotExist() {
		t.equals(
			results.fleschKincaid,
			undefined,
			'Flesch-Kincaid does not exist.'
		)
	}

	function smogDoesNotExist() {
		t.equals(results.smog, undefined, 'SMOG does not exist.')
	}

	function gunningFogDoesNotExist() {
		t.equals(results.gunningFog, undefined, 'Gunning-Fog does not exist.')
	}
})

/*
Function round(val) {
	return Math.round(val * 1e6) / 1e6
}
*/
