interface ReadabilityConfig {
	difficultWords?: boolean
	capsAsNames?: boolean
	onlySpache?: boolean
	onlyDaleChall?: boolean
	onlyARI?: boolean
	onlyColemanLiau?: boolean
	onlyFleschKincaid?: boolean
	onlySMOG?: boolean
	onlyGunningFog?: boolean
	skipDaleChall?: boolean
	skipARI?: boolean
	skipColemanLiau?: boolean
	skipFleschKincaid?: boolean
	skipSMOG?: boolean
	skipGunningFog?: boolean
}

function readabilityScores(
	value: string,
	config?: ReadabilityConfig
): {
	letterCount: number
	syllableCount: number
	wordCount: number
	sentenceCount: number
	polysyllabicWordCount: number
	polysyllabicWords?: string[]
	spacheUniqueUnfamiliarWordCount?: number
	spacheUniqueUnfamiliarWords?: string[]
	spache?: number
	daleChallDifficultWordCount?: number
	daleChallDifficultWords?: string[]
	daleChall?: number
	ari?: number
	colemanLiau?: number
	fleschKincaid?: number
	smog?: number
	gunningFog?: number
}
export = readabilityScores
