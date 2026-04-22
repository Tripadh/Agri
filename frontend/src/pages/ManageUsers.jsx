import { useEffect, useState, useCallback } from 'react';
import { deleteUser, getUsers, updateUserRole } from '../services/adminService';
import Pagination from '../components/Pagination/Pagination';
import FilterPanel from '../components/Filters/FilterPanel';
import SortDropdown from '../components/Filters/SortDropdown';
import './Forms.css';
import './ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const [currentSort, setCurrentSort] = useState('latest');
  const [currentFilters, setCurrentFilters] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sort: currentSort,
        search: currentFilters.search || '',
        role: currentFilters.role || '',
      };
      const data = await getUsers(params);
      
      // Handle array vs paginated format smoothly
      if (Array.isArray(data.users)) {
        // Backend didn't return paginated metadata (using old endpoint style)
        // Fallback or use standard structure
        setUsers(data.users);
        setTotalItems(data.users.length);
      } else {
        setUsers(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setHasNextPage(data.hasNextPage || false);
        setHasPrevPage(data.hasPrevPage || false);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, currentSort, currentFilters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId, role) => {
    await updateUserRole(userId, role);
    await loadUsers();
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(userId);
    if (users.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      await loadUsers();
    }
  };

  const handleFilterChange = (id, value) => {
    setCurrentFilters(prev => ({ ...prev, [id]: value }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setCurrentFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const userFiltersConfig = [
    {
      id: 'role',
      label: 'Role',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
      ]
    }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  return (
    <section className="card manage-users-shell">
      <div className="page-head">
        <div>
          <h1>Manage Users</h1>
          <p>Total platform users: {totalItems}</p>
        </div>
      </div>

      <div className="filters-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
        <FilterPanel 
          filters={userFiltersConfig} 
          currentFilters={currentFilters} 
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        <SortDropdown 
          sortOptions={sortOptions} 
          currentSort={currentSort} 
          onSortChange={(val) => { setCurrentSort(val); setPage(1); }} 
        />
      </div>

      <div className="table-wrap">
        {loading ? (
           <p>Loading users...</p>
        ) : users.length === 0 ? (
           <p>No users found matching your filters.</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td className="actions-cell">
                      <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <button type="button" className="danger-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
              hasNextPage={hasNextPage} 
              hasPrevPage={hasPrevPage} 
            />
          </>
        )}
      </div>
    </section>
  );
}

export default ManageUsers;
