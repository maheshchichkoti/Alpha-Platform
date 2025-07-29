import React from "react";

type Person = {
  id: string;
  fullName: string;
  email: string;
  title: string;
  company: { id: string; name: string; domain: string };
};

type Props = {
  people: Person[];
  onEnrich: (person: Person) => void;
};

export default function PeopleList({ people, onEnrich }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Title</th>
          <th>Company</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {people.map((p) => (
          <tr key={p.id}>
            <td>{p.fullName}</td>
            <td>{p.email}</td>
            <td>{p.title}</td>
            <td>{p.company?.name}</td>
            <td>
              <button onClick={() => onEnrich(p)}>Run Research</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
