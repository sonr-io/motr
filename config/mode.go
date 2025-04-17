package config

type MotrMode string

const (
	ControllerMode MotrMode = "controller"
	ResolverMode   MotrMode = "resolver"
)

func (m MotrMode) String() string {
	return string(m)
}
