//go:build js && wasm
// +build js,wasm

package kvstore

import (
	"encoding/json"
	"strconv"

	"github.com/syumai/workers/cloudflare/kv"
)

type Store interface {
	Get(key string) (string, error)
	Exists(key string) bool
	Set(key string, value string) error
	Delete(key string) error
	Namespace() *kv.Namespace
	GetInt(key string) (int, error)
	SetInt(key string, value int) error
	GetJSON(key string, v any) error
	SetJSON(key string, v any) error
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

func (s *store) GetInt(key string) (int, error) {
	v, err := s.namespace.GetString(key, nil)
	if err != nil {
		return 0, err
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return 0, err
	}
	return i, nil
}

func (s *store) SetInt(key string, value int) error {
	return s.namespace.PutString(key, strconv.Itoa(value), nil)
}

func (s *store) GetJSON(key string, v any) error {
	jsonString, err := s.namespace.GetString(key, nil)
	if err != nil {
		return err
	}
	err = json.Unmarshal([]byte(jsonString), v)
	if err != nil {
		return err
	}
	return nil
}

func (s *store) SetJSON(key string, v any) error {
	jsonString, err := json.Marshal(v)
	if err != nil {
		return err
	}
	s.namespace.PutString(key, string(jsonString), nil)
	return nil
}
