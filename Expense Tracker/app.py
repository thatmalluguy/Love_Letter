import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect

# Create the Flask application
app = Flask(__name__)

# Database connection function
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database
def init_db():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    
    # Create expenses table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        category TEXT,
        amount REAL,
        description TEXT
    )
    ''')
    
    connection.commit()
    connection.close()
    print("Database setup complete!")

# Route: Home Page (View Expenses)
@app.route('/')
def index():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    # Fetch all expenses from the database
    cursor.execute("SELECT date, category, amount, description FROM expenses ORDER BY date DESC")
    expenses = cursor.fetchall()

    # Calculate summary statistics
    total_amount = 0
    monthly_amount = 0
    categories = set()
    current_month = datetime.now().strftime('%Y-%m')

    if expenses:
        for expense in expenses:
            total_amount += expense[2]  # Sum all amounts
            if expense[0].startswith(current_month):  # Check if expense is from current month
                monthly_amount += expense[2]
            categories.add(expense[1])  # Add category to set

    connection.close()

    # Pass all necessary data to the template
    return render_template('index.html',
                         expenses=expenses,
                         total_amount=total_amount,
                         monthly_amount=monthly_amount,
                         categories_count=len(categories))

# Route: Add Expense Page
@app.route('/add_expense', methods=['GET', 'POST'])
def add_expense():
    if request.method == 'POST':
        try:
            date = request.form['date']
            category = request.form['category']
            amount = float(request.form['amount'])
            description = request.form['description']

            conn = get_db_connection()
            conn.execute("INSERT INTO expenses (date, category, amount, description) VALUES (?, ?, ?, ?)",
                        (date, category, amount, description))
            conn.commit()
            conn.close()
            return redirect('/')
        except Exception as e:
            print(f"Error adding expense: {e}")
            return "An error occurred while adding the expense.", 500
            
    return render_template('add_expense.html')

# Initialize the database when the application starts
init_db()

if __name__ == '__main__':
    app.run(debug=True)