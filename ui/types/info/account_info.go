package info

type AccountInfo struct {
	Address string
	Name    string
	Handle  string
	Block   string
}

// Helper function to shorten address
func (a AccountInfo) ShortAddr() string {
	if len(a.Address) <= 20 {
		return a.Address
	}
	return a.Address[:16] + "..." + a.Address[len(a.Address)-4:]
}
