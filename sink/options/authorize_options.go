package options

// AuthorizeOptions represents the options for authorizing a service
type AuthorizeOptions struct {
	Controller           string
	Handle               string
	Origin               string
	Service              ServiceRecord
	RequestedPermissions []PermissionRequest
}

// PermissionRequest represents a request for a permission
type PermissionRequest struct {
	Title       string // Title of the permission
	Description string // Description of the permission
	Type        string // Know, Read, Write, Admin
}

// ServiceRecord represents a service record
type ServiceRecord struct {
	Origin      string
	Name        string
	Description string
	Categories  []string
	CreatedAt   int64
	Icon        string
	Version     string
	Author      string
}
