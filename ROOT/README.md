# RiaGo – Rianne's Food Corner

This folder contains the current RiaGo HTML/CSS/JavaScript interface and a Node.js + Express API connected to MySQL running through XAMPP. All five dashboards now read and write the MySQL database.

## Technology

- Frontend: HTML, CSS, browser JavaScript
- Backend: Node.js + Express.js (ES modules), layered as routes → controllers → services → models
- Database: MySQL (start it through XAMPP; manage it with phpMyAdmin)
- Customer registration: email OTP sent by the backend

> This project is not a React/JSX project. The uploaded source uses separate HTML pages and CSS files. It is kept in that format so the existing work is not needlessly rewritten.

## 1. Start MySQL in XAMPP

1. Open XAMPP Control Panel.
2. Start **MySQL**. Apache is not required for this Node.js setup.
3. Open `http://localhost/phpmyadmin`.
4. Choose **Import**, select `database/riago.sql`, then click **Import** / **Go**.
5. The script creates the `riago_db` database and its tables, with starter menu items.

> **Already imported an older `riago.sql`?** Run `database/upgrade-old-database.sql` once in phpMyAdmin (SQL tab) first, then import `database/riago.sql` again. It only replaces the menu/order tables; customer accounts are kept. If you forget, the server stops and tells you.

## 2. Configure the backend

1. Install Node.js LTS on the computer if it is not installed.
2. Open the `backend` folder in VS Code.
3. Copy `.env.example` and rename the copy to `.env`.
4. Check the MySQL settings. The default XAMPP setup commonly uses `root`, an empty password, and port `3306`; use the values configured on your own PC.
5. Set your own secret `ADMIN_USERNAME` and `ADMIN_PASSWORD`. The server will not start until you change them. These are the only credentials for the Admin page; they are never placed in frontend code.
6. Set `JWT_SECRET` to a long private random value. Do not share it or commit `.env` to GitHub.
7. Configure SMTP values to send real OTP emails. For Gmail, use an App Password (not your normal Gmail password) after enabling 2-Step Verification. Never put SMTP credentials in frontend JavaScript.
8. Open a terminal in `backend` and run:

```bash
npm install
npm run dev
```

If successful, the server displays `RiaGo is running at http://localhost:3000`.

## 3. Open and test

- Customers: `http://localhost:3000/login.html` (customer login and registration only).
- Cashier and Kitchen have **no login**: open `http://localhost:3000/cashier.html` or `http://localhost:3000/kitchen.html` and the dashboard appears right away (the page gets its own access automatically). To require a login again, set `REQUIRE_STATION_LOGIN=true` in `backend/.env`.
- Staff (Admin and Riders): `http://localhost:3000/staff-login.html`. This page is intentionally not linked from the customer site. Admin signs in with the credentials from `.env`. Riders use the accounts the admin creates under Account Management. Only the public pages (HTML, `css/`, `js/`, `images/`) are served; `backend/` and `database/` are not reachable from the browser.
- API/database health check: `http://localhost:3000/api/health`.
- A healthy response should report `"database":"connected"`.
- Customer registration sends a real email OTP. Enter the code from the email to create the account.
- Customer login uses the account created after OTP verification.

Do not use a fake OTP in a real registration flow. If SMTP is not configured, the API returns an error instead of pretending an email was sent.

## 4. What is connected to MySQL

Everything now goes through the Node.js API into MySQL, so every role sees the same live data:

- **Admin** – add / edit / disable / archive menu items (saved in `menu_items`) with a **food picture** (JPG, PNG or WEBP, max 3 MB; use the file box when adding, or the **Photo** button on a menu row to add or replace it), update stock, view orders and sales, view customers, create and remove rider accounts.
- **Customer** – menu comes from the database; checkout creates an order (`orders` + `order_items`); recent orders update by themselves.
- **Cashier** – accepts or rejects online orders (stock is deducted on accept), creates counter orders (stock deducted immediately), assigns riders, releases counter orders.
- **Kitchen** – sees the queue and marks orders preparing / ready. Customer details are hidden from the kitchen.
- **Rider** – sees only their own assigned deliveries; start delivery, delivered, failed.
- Cashier / Kitchen / Rider pages refresh by themselves every few seconds.

Order flow: customer places order (`placed`) → cashier accepts (`in_process`, stock deducted) → kitchen preparing → ready → cashier assigns rider → rider out for delivery → complete (or failed). Counter orders skip the rider: kitchen ready → cashier releases to customer (complete).

Notes:
- Testing several roles at once: every browser tab keeps its own login, so Customer, Rider, Admin, Cashier and Kitchen can all be open in the same browser. A refresh keeps the login; closing the tab logs out.
- Cashier and Kitchen need no login. They use built-in accounts (`cashier` / `kitchen`) that the server creates by itself, and the pages sign in to them automatically. The same accounts can still log in on `staff-login.html` (default passwords `cashier123` / `kitchen123`, changeable in `.env`).
- The low-stock alert level in Settings is saved in the browser only.
- Food pictures are saved in the `images/menu/` folder and their path in `menu_items.image_path`. Foods without a picture show their emoji. The pictures are not part of the database, so copy the `images/menu/` folder when moving the project to another computer.

### Main API endpoints

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register/request-otp`, `/register/verify-otp`, `/login/customer`, `/login/admin`, `/login/staff`, `/station/:role` (cashier/kitchen), `GET /api/auth/me` |
| Menu | `GET /api/menu`, `GET /api/menu/admin`, `POST /api/menu`, `PUT /api/menu/:id`, `POST /api/menu/:id/image` (raw JPG/PNG/WEBP file), `PATCH /api/menu/:id/availability`, `/stock`, `/archive` |
| Orders | `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders`, `POST /api/orders/counter`, `POST /api/orders/:id/accept`, `/reject`, `/assign-rider`, `/release`, `/dispatch`, `/deliver`, `/fail`, `PATCH /api/orders/:id/kitchen` |
| Users | `GET /api/users/customers`, `GET/POST /api/users/staff` (riders), `DELETE /api/users/staff/:id`, `GET /api/users/riders` |

## 5. Project folders

```text
RiaGo/
├── backend/
│   ├── config/db.js
│   ├── middleware/ (auth.js, errorHandler.js)
│   ├── routes/ (authRoutes.js, menuRoutes.js, orderRoutes.js, userRoutes.js)
│   ├── controllers/ (authController.js, menuController.js, orderController.js, userController.js)
│   ├── services/ (authService.js, menuService.js, orderService.js, userService.js)
│   ├── models/ (userModel.js, pendingRegistrationModel.js, menuModel.js, orderModel.js)
│   ├── utils/ (email.js, httpError.js, validate.js, builtInStaff.js)
│   ├── app.js
│   ├── .env.example
│   └── package.json
├── css/
│   ├── theme.css
│   ├── base.css
│   ├── effects.css
│   ├── customer.css
│   ├── cashier.css
│   ├── kitchen.css
│   ├── rider.css
│   ├── admin.css
│   └── auth.css
├── database/ (riago.sql, upgrade-old-database.sql)
├── docs/FILE-EXPLANATION.md
├── images/logo.jpg
├── js/ (api.js, auth.js, common.js, main.js,
│        customer.js, cashier.js, kitchen.js, rider.js, admin.js)
├── customer.html
├── cashier.html
├── kitchen.html
├── rider.html
├── admin.html
├── login.html
└── staff-login.html
```

## Safety / GitHub

- Commit `backend/.env.example`, but **never** commit `backend/.env`.
- Do not put passwords, email app passwords, OTPs, or JWT secrets in screenshots or source code.
- Use test accounts while developing.
