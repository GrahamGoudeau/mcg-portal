package enrollment

import "errors"

type Type string

const (
	CurrentStudent Type = "Current Student"
	Alum           Type = "Alum"
	Staff          Type = "Staff"
)

func ConvertToEnrollment(value string) (Type, error) {
	if value == string(CurrentStudent) {
		return CurrentStudent, nil
	} else if value == string(Alum) {
		return Alum, nil
	} else if value == string(Staff) {
		return Staff, nil
	}

	return "", errors.New("unrecognized enrollment status")
}

func (t *Type) ConvertToNillableString() *string {
	if t == nil {
		return nil
	}
	val := string(*t)
	return &val
}
