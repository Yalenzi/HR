import { useState, useEffect } from 'react';
import { employees } from '../lib/database';

export default function EmployeeSearch({ onEmployeeSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = employees.filter(emp => 
        emp.name.includes(searchTerm) || 
        emp.nationalId.includes(searchTerm) ||
        emp.id.includes(searchTerm)
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  const selectEmployee = (employee) => {
    onEmployeeSelect(employee);
    setShowResults(false);
    setSearchTerm(employee.name);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهوية أو رقم الموظف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
        />
        <div className="absolute left-3 top-4 text-gray-400">
          🔍
        </div>
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map(employee => (
              <div
                key={employee.id}
                onClick={() => selectEmployee(employee)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-semibold">{employee.name}</div>
                <div className="text-sm text-gray-600">
                  {employee.position} - {employee.department}
                </div>
                <div className="text-xs text-gray-500">
                  رقم الموظف: {employee.id} | رقم الهوية: {employee.nationalId}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-center">
              لم يتم العثور على نتائج
            </div>
          )}
        </div>
      )}
    </div>
  );
}