//go:build js && wasm
// +build js,wasm

package kvstore

import "github.com/syumai/workers/cloudflare/kv"

type Store interface {
	Get(key string) (string, error)
	Exists(key string) bool
	Set(key string, value string) error
	Delete(key string) error
	Namespace() *kv.Namespace
}

func openStore(name string) Store {
	k, err := kv.NewNamespace(name)
	if err != nil {
		panic(err)
	}
	return &store{
		namespace: k,
	}
}

type store struct {
	namespace *kv.Namespace
}

func (s *store) Namespace() *kv.Namespace {
	return s.namespace
}

func (s *store) Get(key string) (string, error) {
	return s.namespace.GetString(key, nil)
}

func (s *store) Exists(key string) bool {
	_, err := s.namespace.GetString(key, nil)
	return err == nil
}

func (s *store) Set(key string, value string) error {
	return s.namespace.PutString(key, value, nil)
}

func (s *store) Delete(key string) error {
	return s.namespace.Delete(key)
}
