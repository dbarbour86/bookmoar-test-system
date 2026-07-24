/**
 * CSV Import Sanitization & High-Performance Batch Ingestion Pipeline
 */

/**
 * Sanitizes and formats phone numbers into standard E.164 international format.
 * Strips spaces, dashes, dots, and parentheses.
 * Automatically prepends +1 for 10-digit US numbers.
 *
 * @param {string} rawPhone - Raw input phone string from CSV
 * @returns {string} E.164 formatted phone number (e.g., "+15552345678")
 */
export function sanitizePhoneE164(rawPhone) {
  if (!rawPhone) return '';
  
  // Remove all non-numeric characters except leading '+'
  let digits = rawPhone.replace(/[^\d+]/g, '');

  if (digits.startsWith('+')) {
    return digits;
  }

  // If 10 digits (US standard), prepend '+1'
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If 11 digits starting with 1 (US standard with country code), prepend '+'
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  return digits ? `+${digits}` : '';
}

/**
 * Maps raw CSV row objects based on user-defined column mapping choices
 * and applies sanitization rules.
 *
 * @param {Array<Object>} rawCsvRows - Parsed JSON objects from CSV
 * @param {Object} columnMapping - User header map { firstNameKey, lastNameKey, phoneKey, emailKey }
 * @param {string} tenantId - Active tenant ID context
 * @returns {Array<Object>} Sanitized contact objects ready for database insertion
 */
export function sanitizeCsvContacts(rawCsvRows, columnMapping, tenantId) {
  return rawCsvRows.map((row, index) => {
    const rawFirstName = row[columnMapping.firstNameKey] || '';
    const rawLastName = row[columnMapping.lastNameKey] || '';
    const rawPhone = row[columnMapping.phoneKey] || '';
    const rawEmail = row[columnMapping.emailKey] || '';

    // Handle single 'Name' column if First/Last aren't split in CSV
    let firstName = rawFirstName.trim();
    let lastName = rawLastName.trim();

    if (!lastName && firstName.includes(' ')) {
      const parts = firstName.split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    const sanitizedPhone = sanitizePhoneE164(rawPhone);
    const sanitizedEmail = rawEmail.trim().toLowerCase();

    return {
      id: `c-csv-${Date.now()}-${index}`,
      tenant_id: tenantId,
      first_name: firstName || 'Valued',
      last_name: lastName || 'Customer',
      phone: sanitizedPhone,
      email: sanitizedEmail,
      status: 'lead', // Forced default
      source: 'csv_import', // Metadata tag
      address: 'CSV Re-activation Bulk Import',
      notes: `Ingested via CSV Reactivation Campaign on ${new Date().toISOString().split('T')[0]}`,
      createdAt: new Date().toISOString(),
      bookings: []
    };
  });
}

/**
 * Builds high-performance PostgreSQL UNNEST batch query string & parameterized values.
 * Allows inserting 500+ records in a single database roundtrip.
 *
 * Query Structure:
 * INSERT INTO contacts (tenant_id, first_name, last_name, phone, email, status, source)
 * SELECT $1, unnest($2::text[]), unnest($3::text[]), unnest($4::text[]), unnest($5::text[]), 'lead', 'csv_import'
 * RETURNING id;
 */
export function buildPostgresBatchInsertQuery(contacts, tenantId) {
  const firstNames = contacts.map((c) => c.first_name);
  const lastNames = contacts.map((c) => c.last_name);
  const phones = contacts.map((c) => c.phone);
  const emails = contacts.map((c) => c.email);

  const queryText = `
    INSERT INTO contacts (
      tenant_id,
      first_name,
      last_name,
      phone,
      email,
      status,
      source,
      created_at
    )
    SELECT 
      $1 AS tenant_id,
      unnest($2::text[]) AS first_name,
      unnest($3::text[]) AS last_name,
      unnest($4::text[]) AS phone,
      unnest($5::text[]) AS email,
      'lead' AS status,
      'csv_import' AS source,
      CURRENT_TIMESTAMP AS created_at
    RETURNING id;
  `;

  const queryParams = [
    tenantId,
    firstNames,
    lastNames,
    phones,
    emails
  ];

  return { queryText, queryParams };
}
