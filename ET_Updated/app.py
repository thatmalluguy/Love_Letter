import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect, jsonify
from calendar import month_name
import json

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    
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

@app.route('/')
def index():
    connection = get_db_connection()
    cursor = connection.cursor()

    # for Fetching all expenses
    cursor.execute("SELECT id, date, category, amount, description FROM expenses ORDER BY date DESC")
    expenses = [dict(expense) for expense in cursor.fetchall()]  # Convert to list of dicts

    # Initializing of default values
    total_amount = 0
    monthly_amount = 0
    category_totals = {}
    monthly_totals = {}
    current_month = datetime.now().strftime('%Y-%m')

    if expenses:
        for expense in expenses:
            amount = float(expense['amount'])  # tTo Ensure amount is float
            category = expense['category']
            date = expense['date']
            
            total_amount += amount
            
            # Monthly calculations
            if date.startswith(current_month):
                monthly_amount += amount
            
            # Category totals for pie chart
            category_totals[category] = category_totals.get(category, 0) + amount
            
            # Monthly totals for bar chart
            month_key = date[:7]  # Gets YYYY-MM
            monthly_totals[month_key] = monthly_totals.get(month_key, 0) + amount

        # Calculate average amount
        average_amount = total_amount / len(expenses)
    else:
        average_amount = 0

    # Prepare chart data - ensure we always have valid JSON
    chart_data = [{"category": k, "amount": float(v)} for k, v in category_totals.items()]
    
    # Prepare monthly chart data (last 6 months)
    sorted_months = sorted(monthly_totals.items(), reverse=True)[:6]
    monthly_chart_data = [
        {
            "month": month_name[int(month.split('-')[1])],
            "amount": float(amount)
        }
        for month, amount in sorted_months
    ]

    # Always ensure we have valid JSON, even if empty
    if not chart_data:
        chart_data = []
    if not monthly_chart_data:
        monthly_chart_data = []

    connection.close()

    return render_template('index.html',
                         expenses=expenses,
                         total_amount=total_amount,
                         monthly_amount=monthly_amount,
                         categories_count=len(category_totals),
                         average_amount=average_amount,
                         chart_data=json.dumps(chart_data),
                         monthly_chart_data=json.dumps(monthly_chart_data))

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

@app.route('/delete_expense/<int:id>', methods=['DELETE'])
def delete_expense(id):
    try:
        conn = get_db_connection()
        conn.execute("DELETE FROM expenses WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error deleting expense: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)