import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container">
      <header className="padding-responsive">
        <h1 className="text-responsive">Marketing Campaign Builder</h1>
      </header>
      <main className="padding-responsive">
        <div className="card margin-responsive">
          <h2>Welcome to the Marketing Campaign Builder</h2>
          <p className="margin-responsive">
            This tool allows you to create and manage marketing campaigns with custom forms.
          </p>
          <div className="margin-responsive">
            <Link to="/builder" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Start Building a Form
            </Link>
            <Link to="/test" className="btn btn-secondary">
              View Test Form
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
