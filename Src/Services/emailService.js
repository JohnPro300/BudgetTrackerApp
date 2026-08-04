import transporter from '../Config/email.js';

const FROM = process.env.EMAIL_FROM || '"Budget Tracker" <noreply@budgettracker.com>';

// Welcome Email
export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#6366f1">Welcome to Budget Tracker, ${user.name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Start tracking your income and expenses, set budgets, and generate insightful reports.</p>
      <br/>
      <p style="color:#888;font-size:12px">If you did not create this account, please ignore this email.</p>
    </div>`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Welcome to Budget Tracker!',
    html,
  });
};

// Budget Alert: 80% threshold
export const sendBudget80Alert = async (user, budgetInfo) => {
  const { limitAmount, spent, budgetLabel, month, year } = budgetInfo;
  const percentage = Math.round((spent / limitAmount) * 100);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#f59e0b">Budget Alert — 80% Reached</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>You have used <strong>${percentage}%</strong> of your <strong>${budgetLabel}</strong> budget for <strong>${getMonthName(month)} ${year}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr style="background:#f3f4f6">
          <td style="padding:8px;border:1px solid #e5e7eb"><strong>Budget Limit</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb">$${limitAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb"><strong>Amount Spent</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb">$${spent.toFixed(2)}</td>
        </tr>
        <tr style="background:#fef3c7">
          <td style="padding:8px;border:1px solid #e5e7eb"><strong>Remaining</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb">$${(limitAmount - spent).toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin-top:16px">You have <strong>$${(limitAmount - spent).toFixed(2)}</strong> left. Consider reviewing your spending.</p>
      <br/>
      <p style="color:#888;font-size:12px">This is an automated alert from Budget Tracker.</p>
    </div>`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `80% Budget Alert — ${budgetLabel} (${getMonthName(month)} ${year})`,
    html,
  });
};

// Budget Alert: 100% threshold
export const sendBudget100Alert = async (user, budgetInfo) => {
  const { limitAmount, spent, budgetLabel, month, year } = budgetInfo;
  const percentage = Math.round((spent / limitAmount) * 100);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#ef4444">Budget Exceeded!</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>You have used <strong>${percentage}%</strong> of your <strong>${budgetLabel}</strong> budget for <strong>${getMonthName(month)} ${year}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr style="background:#f3f4f6">
          <td style="padding:8px;border:1px solid #e5e7eb"><strong>Budget Limit</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb">$${limitAmount.toFixed(2)}</td>
        </tr>
        <tr style="background:#fee2e2">
          <td style="padding:8px;border:1px solid #e5e7eb"><strong>Amount Spent</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb">$${spent.toFixed(2)}</td>
        </tr>
        <tr style="background:#fee2e2">
          <td style="padding:8px;border:1px solid #e5e7eb"><strong>Over Budget By</strong></td>
          <td style="padding:8px;border:1px solid #e5e7eb">$${(spent - limitAmount).toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin-top:16px;color:#ef4444"><strong>You have exceeded your budget limit. Please review your expenses immediately.</strong></p>
      <br/>
      <p style="color:#888;font-size:12px">This is an automated alert from Budget Tracker.</p>
    </div>`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Budget Exceeded — ${budgetLabel} (${getMonthName(month)} ${year})`,
    html,
  });
};

// Helper function to get month name from number
const getMonthName = (month) =>
  new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
