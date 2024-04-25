/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  );
  const user = usersFromServer.find(us => us.id === category.ownerId); // find by category.ownerId

  return {
    ...product,
    categoryId: category.id,
    categoryTitle: category.title,
    categoryIcon: category.icon,
    userId: user.id,
    userName: user.name,
    userSex: user.sex,
  };
});

export const App = () => {
  const [selectedUser, setSelectedUser] = useState('All');
  const [productFilter, setProductFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sort, setSort] = useState(null);

  const filteredProducts = products.filter(product => {
    const filterUser =
      selectedUser === 'All' ? true : product.userName === selectedUser;

    const filterProduct = product.name.toLowerCase().includes(productFilter);

    const filterCategories = selectedCategories.length
      ? selectedCategories.includes(product.categoryTitle)
      : true;

    return filterUser && filterProduct && filterCategories;
  });

  const sortProducts = () => {
    const newResult = [...filteredProducts];

    if (!sort) {
      return newResult;
    }

    newResult.sort((a, b) => {
      if (sort.direction === 'asc') {
        if (typeof a[sort.column] === 'string') {
          return a[sort.column].localeCompare(b[sort.column]);
        }

        return a[sort.column] - b[sort.column];
      }

      if (typeof a[sort.column] === 'string') {
        return b[sort.column].localeCompare(a[sort.column]);
      }

      return b[sort.column] - a[sort.column];
    });

    return newResult;
  };

  const handleSort = column =>
    setSort(currentSort => {
      if (!currentSort || currentSort.column !== column) {
        return { column, direction: 'asc' };
      }

      if (currentSort.column === column && currentSort.direction === 'asc') {
        return { column, direction: 'dsc' };
      }

      return null;
    });

  const handleSelectUser = user => () => setSelectedUser(user);

  const resetFilterProduct = () => setProductFilter('');

  const resetAll = () => {
    resetFilterProduct();
    setSelectedUser('All');
    setSelectedCategories([]);
  };

  const sortIcon = column => {
    if (!sort || sort?.column !== column) {
      return 'fas fa-sort';
    }

    if (sort?.column === column && sort.direction === 'asc') {
      return 'fas fa-sort-up';
    }

    return 'fas fa-sort-down';
  };

  const handleSelectCategories = category =>
    setSelectedCategories(currentState => {
      if (category === 'All') {
        return [];
      }

      if (currentState.includes(category)) {
        return currentState.filter(item => item !== category);
      }

      return [...currentState, category];
    });

  const isUserActive = currentUser =>
    selectedUser === currentUser ? 'is-active' : '';

  const handleFilterProduct = e =>
    setProductFilter(e.target.value.toLowerCase());

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={handleSelectUser('All')}
                className={isUserActive('All')}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={handleSelectUser(user.name)}
                  className={isUserActive(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  onChange={handleFilterProduct}
                  className="input"
                  placeholder="Search"
                  value={productFilter}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {!!productFilter && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={resetFilterProduct}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button ${!selectedCategories.length ? '' : 'is-outlined'} is-success mr-6 `}
                onClick={() => handleSelectCategories('All')}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategories.includes(category.title) ? 'is-info' : ''}`}
                  href="#/"
                  onClick={() => handleSelectCategories(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAll}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!filteredProducts.length && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          {!!filteredProducts.length && (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/" onClick={() => handleSort('id')}>
                        <span className="icon">
                          <i data-cy="SortIcon" className={sortIcon('id')} />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/" onClick={() => handleSort('name')}>
                        <span className="icon">
                          <i data-cy="SortIcon" className={sortIcon('name')} />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/" onClick={() => handleSort('categoryTitle')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={sortIcon('categoryTitle')}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/" onClick={() => handleSort('userName')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={sortIcon('userName')}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortProducts().map(row => (
                  <tr key={row.id} data-cy="Product">
                    <td data-cy="ProductId">{row.id}</td>
                    <td data-cy="ProductName">{row.name}</td>
                    <td data-cy="ProductCategory">
                      {row.categoryIcon} - {row.categoryTitle}
                    </td>
                    <td
                      data-cy="ProductUser"
                      className={`has-text-${row.userSex === 'm' ? 'link' : 'danger'}`}
                    >
                      {row.userName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
