package html

type Metadata struct {
	Title          string
	Author         string
	Favicon        string
	Robots         string
	Googlebot      string
	Google         string
	Description    string
	Keywords       string
	CanonicalURL   string
	OGImage        string
	OGURL          string
	OGSiteName     string
	TwitterSite    string
	TwitterCreator string
	TwitterImage   string
}

func DefaultMetadata() Metadata {
	return Metadata{
		Title:          "Sonr",
		Author:         "Sonr",
		Favicon:        "https://cdn.sonr.id/favicon.png",
		Robots:         "index, follow",
		Googlebot:      "index, follow",
		Google:         "nositelinkssearchbox",
		Description:    "Sonr is a decentralized social network that allows you to create your own personalized digital identity.",
		Keywords:       "Sonr, social network, decentralized, identity, decentralized social network, decentralized identity, self-sovereign identity, self-sovereign, self-sovereign social network, self-sovereign identity network, sso, sso network, sso identity, sso social network, digital identity, digital social network",
		CanonicalURL:   "https://sonr.io",
		OGImage:        "https://cdn.sonr.id/og.png",
		OGURL:          "https://sonr.io",
		OGSiteName:     "Sonr",
		TwitterSite:    "@sonr_io",
		TwitterCreator: "@sonr_io",
		TwitterImage:   "https://cdn.sonr.id/og.png",
	}
}
