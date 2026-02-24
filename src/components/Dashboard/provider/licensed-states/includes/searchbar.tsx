import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
  return (
    <div className="d-flex border rounded overflow-hidden bg-white py-2">
      <span className="d-flex align-items-center ps-3 text-muted">
        <FiSearch />
      </span>
      <input
        type="text"
        className="form-control border-0 ps-1 text-sm"
        placeholder="Search by state name"
      />
    </div>
  );
}
