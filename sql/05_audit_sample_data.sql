-- AI Auditor GRC - Audit Sample Data and Test Cases
-- File: 05_audit_sample_data.sql
-- Description: Sample data for testing and demonstration purposes

-- Clear existing data (for development/testing only)
-- TRUNCATE TABLE audit_notifications CASCADE;
-- TRUNCATE TABLE audit_comments CASCADE;
-- TRUNCATE TABLE audit_status_history CASCADE;
-- TRUNCATE TABLE audit_time_entries CASCADE;
-- TRUNCATE TABLE audit_phases CASCADE;
-- TRUNCATE TABLE audit_planning_documents CASCADE;
-- TRUNCATE TABLE audit_objectives CASCADE;
-- TRUNCATE TABLE audit_team_members CASCADE;
-- TRUNCATE TABLE audits CASCADE;

-- Insert sample business units (if not already present)
INSERT INTO business_units (id, name, code, description, manager_id, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'IT', 'Technology infrastructure and applications', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Human Resources', 'HR', 'Employee management and development', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Finance', 'FIN', 'Financial operations and accounting', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440004', 'Operations', 'OPS', 'Core business operations', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440005', 'Sales', 'SALES', 'Sales and customer relations', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440006', 'Marketing', 'MKTG', 'Marketing and brand management', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440007', 'Legal & Compliance', 'LEGAL', 'Legal affairs and regulatory compliance', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440008', 'Research & Development', 'RND', 'Product development and innovation', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample users (if not already present)
INSERT INTO users (id, email, first_name, last_name, role, department, business_unit_id, is_active)
VALUES
    -- Super Admin
    ('550e8400-e29b-41d4-a716-446655440101', 'admin@company.com', 'System', 'Administrator', 'super_admin', 'IT', '550e8400-e29b-41d4-a716-446655440001', true),

    -- CRO
    ('550e8400-e29b-41d4-a716-446655440102', 'cro@company.com', 'Jane', 'Smith', 'cro', 'Audit', NULL, true),

    -- Supervisor Auditors
    ('550e8400-e29b-41d4-a716-446655440103', 'supervisor1@company.com', 'Michael', 'Johnson', 'supervisor_auditor', 'Internal Audit', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440104', 'supervisor2@company.com', 'Sarah', 'Williams', 'supervisor_auditor', 'Internal Audit', NULL, true),

    -- Lead Auditors
    ('550e8400-e29b-41d4-a716-446655440105', 'lead1@company.com', 'David', 'Brown', 'auditor', 'Internal Audit', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440106', 'lead2@company.com', 'Lisa', 'Davis', 'auditor', 'Internal Audit', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440107', 'lead3@company.com', 'Robert', 'Miller', 'auditor', 'Internal Audit', NULL, true),

    -- Team Auditors
    ('550e8400-e29b-41d4-a716-446655440108', 'auditor1@company.com', 'Emily', 'Wilson', 'auditor', 'Internal Audit', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440109', 'auditor2@company.com', 'James', 'Moore', 'auditor', 'Internal Audit', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440110', 'auditor3@company.com', 'Amanda', 'Taylor', 'auditor', 'Internal Audit', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440111', 'auditor4@company.com', 'Christopher', 'Anderson', 'auditor', 'Internal Audit', NULL, true),

    -- Business Unit Managers
    ('550e8400-e29b-41d4-a716-446655440112', 'itmanager@company.com', 'Kevin', 'Thomas', 'business_unit_manager', 'IT Management', '550e8400-e29b-41d4-a716-446655440001', true),
    ('550e8400-e29b-41d4-a716-446655440113', 'hrmanager@company.com', 'Jennifer', 'Jackson', 'business_unit_manager', 'HR Management', '550e8400-e29b-41d4-a716-446655440002', true),
    ('550e8400-e29b-41d4-a716-446655440114', 'finmanager@company.com', 'Mark', 'White', 'business_unit_manager', 'Finance Management', '550e8400-e29b-41d4-a716-446655440003', true),

    -- Reviewers
    ('550e8400-e29b-41d4-a716-446655440115', 'reviewer1@company.com', 'Nancy', 'Harris', 'reviewer', 'Quality Assurance', NULL, true),
    ('550e8400-e29b-41d4-a716-446655440116', 'reviewer2@company.com', 'Daniel', 'Martin', 'reviewer', 'Compliance', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample audits
INSERT INTO audits (
    id, title, description, audit_type, status,
    business_unit_id, lead_auditor_id, created_by,
    start_date, end_date, planned_hours,
    objectives, scope, methodology, ai_generated, ai_model_used,
    approval_status
) VALUES
    -- Completed IT Security Audit
    (
        '550e8400-e29b-41d4-a716-446655440201',
        'IT Security Infrastructure Assessment 2024',
        'Comprehensive evaluation of cybersecurity controls, network security, and data protection measures across the organization.',
        'it',
        'completed',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440105',
        '550e8400-e29b-41d4-a716-446655440105',
        '2024-01-15',
        '2024-03-15',
        320,
        ARRAY[
            'Evaluate network security controls and firewall configurations',
            'Assess user access management and authentication systems',
            'Review data encryption and backup procedures',
            'Test incident response and disaster recovery plans',
            'Verify compliance with cybersecurity frameworks'
        ],
        'This audit covers all IT infrastructure components including servers, networks, databases, applications, and security systems. Focus areas include access controls, data protection, network security, and compliance with ISO 27001 standards.',
        'Risk-based approach using NIST Cybersecurity Framework. Testing methodology includes vulnerability assessments, penetration testing, control walkthroughs, and documentation reviews.',
        true,
        'GPT-4',
        'approved'
    ),

    -- In Progress Financial Controls Audit
    (
        '550e8400-e29b-41d4-a716-446655440202',
        'Financial Controls and SOX Compliance Review',
        'Annual assessment of financial reporting controls and Sarbanes-Oxley compliance for fiscal year 2024.',
        'financial',
        'in_progress',
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440106',
        '550e8400-e29b-41d4-a716-446655440106',
        '2024-02-01',
        '2024-05-31',
        480,
        ARRAY[
            'Test design and operating effectiveness of key financial controls',
            'Evaluate management review controls and authorization processes',
            'Assess financial reporting and consolidation procedures',
            'Review journal entry controls and segregation of duties',
            'Validate revenue recognition and expense accrual processes'
        ],
        'Audit encompasses all material financial statement line items and significant business processes. Includes testing of entity-level controls, process-level controls, and IT general controls supporting financial reporting.',
        'Top-down, risk-based approach focusing on material weaknesses and significant deficiencies. Testing includes inquiry, observation, inspection of evidence, and re-performance of controls.',
        false,
        NULL,
        'approved'
    ),

    -- Planning Stage HR Audit
    (
        '550e8400-e29b-41d4-a716-446655440203',
        'Human Resources Compliance and Ethics Audit',
        'Evaluation of HR policies, procedures, and compliance with employment laws and ethical standards.',
        'compliance',
        'planning',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440107',
        '550e8400-e29b-41d4-a716-446655440107',
        '2024-04-01',
        '2024-06-30',
        240,
        ARRAY[
            'Review hiring and onboarding processes for compliance',
            'Evaluate performance management and disciplinary procedures',
            'Assess training programs and professional development',
            'Test payroll and benefits administration controls',
            'Review workplace safety and harassment prevention programs'
        ],
        'Comprehensive review of all HR functions including recruitment, employee relations, compensation, benefits, training, and compliance with labor laws and regulations.',
        'Process walkthroughs, policy reviews, sample testing, and interviews with key personnel. Compliance testing against federal and state employment regulations.',
        true,
        'Claude-3',
        'pending_approval'
    ),

    -- Draft Operations Audit
    (
        '550e8400-e29b-41d4-a716-446655440204',
        'Supply Chain and Vendor Management Audit',
        'Assessment of procurement processes, vendor relationships, and supply chain risk management.',
        'operational',
        'draft',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440105',
        '550e8400-e29b-41d4-a716-446655440105',
        '2024-05-15',
        '2024-08-15',
        360,
        ARRAY[
            'Evaluate vendor selection and approval processes',
            'Review contract management and compliance monitoring',
            'Assess inventory management and warehousing controls',
            'Test procurement authorization and approval workflows',
            'Analyze supplier performance and risk assessment procedures'
        ],
        'End-to-end review of supply chain operations including procurement, vendor management, inventory control, and logistics. Focus on operational efficiency and risk mitigation.',
        'Process mapping, control testing, data analytics, and benchmarking against industry best practices. Risk assessment of key suppliers and critical dependencies.',
        true,
        'GPT-4',
        'draft'
    ),

    -- Overdue Quality Audit
    (
        '550e8400-e29b-41d4-a716-446655440205',
        'Product Quality and Manufacturing Controls',
        'Review of quality assurance processes, manufacturing controls, and regulatory compliance in production.',
        'quality',
        'testing',
        '550e8400-e29b-41d4-a716-446655440008',
        '550e8400-e29b-41d4-a716-446655440107',
        '550e8400-e29b-41d4-a716-446655440107',
        '2024-01-01',
        '2024-03-31',
        400,
        ARRAY[
            'Test quality control procedures and inspection processes',
            'Review manufacturing execution and batch record controls',
            'Evaluate regulatory compliance and documentation',
            'Assess customer complaint handling and corrective actions',
            'Verify calibration and maintenance of equipment'
        ],
        'Comprehensive assessment of quality management systems, manufacturing processes, and regulatory compliance. Includes review of ISO 9001 certification requirements.',
        'Statistical sampling, process observations, documentation reviews, and testing of quality control procedures. Compliance verification against regulatory standards.',
        false,
        NULL,
        'approved'
    ),

    -- Environmental Compliance Audit
    (
        '550e8400-e29b-41d4-a716-446655440206',
        'Environmental Compliance and Sustainability Assessment',
        'Evaluation of environmental management systems, regulatory compliance, and sustainability initiatives.',
        'environmental',
        'reporting',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440106',
        '550e8400-e29b-41d4-a716-446655440106',
        '2024-02-15',
        '2024-04-30',
        280,
        ARRAY[
            'Review environmental permits and regulatory compliance',
            'Assess waste management and disposal procedures',
            'Evaluate air and water quality monitoring systems',
            'Test emergency response and spill prevention controls',
            'Review sustainability reporting and carbon footprint tracking'
        ],
        'Assessment of environmental management practices, regulatory compliance, and sustainability programs across all operational locations.',
        'Site visits, permit reviews, regulatory compliance testing, and evaluation of environmental management systems against ISO 14001 standards.',
        true,
        'Claude-3',
        'approved'
    )
;

-- Set actual dates for completed audit
UPDATE audits
SET
    actual_start_date = '2024-01-15',
    actual_end_date = '2024-03-10',
    actual_hours = 315,
    status = 'completed'
WHERE id = '550e8400-e29b-41d4-a716-446655440201';

-- Set actual start date for in-progress audit
UPDATE audits
SET
    actual_start_date = '2024-02-01',
    actual_hours = 180
WHERE id = '550e8400-e29b-41d4-a716-446655440202';

-- Set actual start date for environmental audit
UPDATE audits
SET
    actual_start_date = '2024-02-15',
    actual_hours = 220
WHERE id = '550e8400-e29b-41d4-a716-446655440206';

-- Insert audit team members
INSERT INTO audit_team_members (audit_id, user_id, role, responsibilities, allocated_hours, added_by) VALUES
    -- IT Security Audit Team
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440108', 'senior_auditor', 'Network security testing and firewall review', 80, '550e8400-e29b-41d4-a716-446655440105'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440109', 'auditor', 'Access controls and user management testing', 60, '550e8400-e29b-41d4-a716-446655440105'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440110', 'specialist', 'Data encryption and backup procedures', 40, '550e8400-e29b-41d4-a716-446655440105'),

    -- Financial Controls Audit Team
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440108', 'senior_auditor', 'Financial reporting controls testing', 120, '550e8400-e29b-41d4-a716-446655440106'),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440111', 'auditor', 'Revenue recognition and expense testing', 100, '550e8400-e29b-41d4-a716-446655440106'),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440109', 'auditor', 'Journal entry and authorization controls', 80, '550e8400-e29b-41d4-a716-446655440106'),

    -- HR Compliance Audit Team
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440110', 'senior_auditor', 'Employment law compliance and policies', 80, '550e8400-e29b-41d4-a716-446655440107'),
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440111', 'auditor', 'Payroll and benefits administration', 60, '550e8400-e29b-41d4-a716-446655440107'),

    -- Supply Chain Audit Team
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440108', 'senior_auditor', 'Vendor management and procurement', 90, '550e8400-e29b-41d4-a716-446655440105'),
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440109', 'auditor', 'Inventory controls and logistics', 70, '550e8400-e29b-41d4-a716-446655440105'),

    -- Quality Audit Team
    ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440110', 'senior_auditor', 'Quality management systems', 100, '550e8400-e29b-41d4-a716-446655440107'),
    ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440111', 'specialist', 'Regulatory compliance and documentation', 80, '550e8400-e29b-41d4-a716-446655440107'),

    -- Environmental Audit Team
    ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440108', 'senior_auditor', 'Environmental compliance and permits', 70, '550e8400-e29b-41d4-a716-446655440106'),
    ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440109', 'auditor', 'Waste management and monitoring', 50, '550e8400-e29b-41d4-a716-446655440106')
;

-- Insert detailed audit objectives
INSERT INTO audit_objectives (audit_id, objective_text, objective_order, ai_generated, ai_confidence_score, completion_status, completed_by, completed_at) VALUES
    -- IT Security Audit Objectives
    ('550e8400-e29b-41d4-a716-446655440201', 'Evaluate the effectiveness of network perimeter security controls including firewalls, intrusion detection systems, and network segmentation', 1, true, 0.92, 'completed', '550e8400-e29b-41d4-a716-446655440108', '2024-02-15'),
    ('550e8400-e29b-41d4-a716-446655440201', 'Assess user access management procedures including provisioning, de-provisioning, and periodic access reviews', 2, true, 0.89, 'completed', '550e8400-e29b-41d4-a716-446655440109', '2024-02-20'),
    ('550e8400-e29b-41d4-a716-446655440201', 'Review data encryption standards for data at rest and in transit, including key management procedures', 3, true, 0.94, 'completed', '550e8400-e29b-41d4-a716-446655440110', '2024-02-25'),
    ('550e8400-e29b-41d4-a716-446655440201', 'Test incident response capabilities and disaster recovery procedures including backup and restoration processes', 4, true, 0.87, 'completed', '550e8400-e29b-41d4-a716-446655440105', '2024-03-05'),
    ('550e8400-e29b-41d4-a716-446655440201', 'Verify compliance with cybersecurity frameworks and regulatory requirements including ISO 27001 and NIST standards', 5, true, 0.91, 'completed', '550e8400-e29b-41d4-a716-446655440105', '2024-03-08'),

    -- Financial Controls Audit Objectives
    ('550e8400-e29b-41d4-a716-446655440202', 'Test the design and operating effectiveness of entity-level controls including tone at the top and control environment', 1, false, NULL, 'in_progress', NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440202', 'Evaluate management review controls for financial reporting including monthly close and variance analysis procedures', 2, false, NULL, 'completed', '550e8400-e29b-41d4-a716-446655440108', '2024-03-15'),
    ('550e8400-e29b-41d4-a716-446655440202', 'Assess revenue recognition controls and procedures for compliance with accounting standards', 3, false, NULL, 'in_progress', NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440202', 'Test journal entry controls including authorization, approval, and segregation of duties', 4, false, NULL, 'pending', NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440202', 'Review financial statement consolidation and reporting procedures including cut-off testing', 5, false, NULL, 'pending', NULL, NULL)
;

-- Insert audit time entries
INSERT INTO audit_time_entries (audit_id, user_id, entry_date, hours_worked, activity_description, billable, approved, approved_by, approved_at) VALUES
    -- IT Security Audit Time Entries
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440105', '2024-01-15', 8.0, 'Audit planning and risk assessment', true, true, '550e8400-e29b-41d4-a716-446655440103', '2024-01-16'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440105', '2024-01-16', 7.5, 'Review of IT policies and procedures', true, true, '550e8400-e29b-41d4-a716-446655440103', '2024-01-17'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440108', '2024-01-20', 8.0, 'Network security testing and firewall configuration review', true, true, '550e8400-e29b-41d4-a716-446655440103', '2024-01-21'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440109', '2024-01-22', 6.0, 'User access testing and privilege analysis', true, true, '550e8400-e29b-41d4-a716-446655440103', '2024-01-23'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440110', '2024-01-25', 7.0, 'Data encryption and backup procedure testing', true, true, '550e8400-e29b-41d4-a716-446655440103', '2024-01-26'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440105', '2024-03-08', 8.0, 'Final audit report preparation and review', true, true, '550e8400-e29b-41d4-a716-446655440103', '2024-03-09'),

    -- Financial Controls Audit Time Entries
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440106', '2024-02-01', 8.0, 'SOX planning and scoping documentation', true, true, '550e8400-e29b-41d4-a716-446655440104', '2024-02-02'),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440108', '2024-02-05', 7.5, 'Entity-level controls testing', true, true, '550e8400-e29b-41d4-a716-446655440104', '2024-02-06'),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440111', '2024-02-10', 8.0, 'Revenue recognition controls testing', true, false, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440109', '2024-02-15', 6.5, 'Journal entry controls walkthrough', true, false, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440106', '2024-03-20', 8.0, 'Management review controls testing', true, false, NULL, NULL),

    -- Environmental Audit Time Entries
    ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440106', '2024-02-15', 8.0, 'Environmental audit planning and site visits', true, true, '550e8400-e29b-41d4-a716-446655440104', '2024-02-16'),
    ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440108', '2024-02-20', 7.0, 'Permit review and regulatory compliance testing', true, true, '550e8400-e29b-41d4-a716-446655440104', '2024-02-21'),
    ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440109', '2024-02-25', 6.0, 'Waste management procedures review', true, false, NULL, NULL)
;

-- Insert audit comments
INSERT INTO audit_comments (audit_id, comment_text, comment_type, is_internal, priority, status, created_by, assigned_to) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', 'Excellent cooperation from IT team throughout the audit process. All requested documentation was provided promptly.', 'general', true, 'low', 'closed', '550e8400-e29b-41d4-a716-446655440105', NULL),
    ('550e8400-e29b-41d4-a716-446655440201', 'Minor deficiency noted in password policy enforcement - recommend implementing stronger complexity requirements.', 'issue', true, 'medium', 'addressed', '550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440112'),
    ('550e8400-e29b-41d4-a716-446655440202', 'Need to schedule follow-up testing for Q2 revenue transactions. Waiting for client to provide additional samples.', 'follow_up', true, 'medium', 'open', '550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440106'),
    ('550e8400-e29b-41d4-a716-446655440202', 'Strong control environment observed in finance department. Management demonstrates commitment to internal controls.', 'general', true, 'low', 'closed', '550e8400-e29b-41d4-a716-446655440108', NULL),
    ('550e8400-e29b-41d4-a716-446655440203', 'Initial planning meeting scheduled for April 1st. HR team excited to participate in the compliance review process.', 'general', true, 'low', 'open', '550e8400-e29b-41d4-a716-446655440107', NULL),
    ('550e8400-e29b-41d4-a716-446655440204', 'Vendor documentation collection in progress. Expecting to receive contracts and performance reports by end of week.', 'follow_up', true, 'medium', 'open', '550e8400-e29b-41d4-a716-446655440105', NULL),
    ('550e8400-e29b-41d4-a716-446655440205', 'Quality system appears robust but documentation gaps identified in calibration records. Management committed to remediation.', 'issue', true, 'high', 'open', '550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440107'),
    ('550e8400-e29b-41d4-a716-446655440206', 'Environmental permits are current and properly maintained. Site visit revealed good housekeeping practices.', 'general', true, 'low', 'closed', '550e8400-e29b-41d4-a716-446655440106', NULL)
;

-- Insert audit notifications
INSERT INTO audit_notifications (
    audit_id, recipient_id, notification_type, title, message, priority, action_required, action_url
) VALUES
    -- IT Security Audit notifications
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440105', 'status_change', 'Audit Completed: IT Security Infrastructure Assessment 2024', 'Your audit has been completed successfully. Please review the final report.', 'medium', false, '/audits/550e8400-e29b-41d4-a716-446655440201'),
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440103', 'status_change', 'Audit Completed: IT Security Infrastructure Assessment 2024', 'The audit under your supervision has been completed.', 'medium', false, '/audits/550e8400-e29b-41d4-a716-446655440201'),

    -- Financial Controls Audit notifications
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440106', 'status_change', 'Audit Status Update: Financial Controls and SOX Compliance Review', 'Audit is currently in progress. Fieldwork phase ongoing.', 'medium', false, '/audits/550e8400-e29b-41d4-a716-446655440202'),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440104', 'assignment', 'Supervisor Assignment: Financial Controls and SOX Compliance Review', 'You have been assigned as supervisor for this audit.', 'high', true, '/audits/550e8400-e29b-41d4-a716-446655440202'),

    -- HR Compliance Audit notifications
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440107', 'assignment', 'New Audit Assignment: Human Resources Compliance and Ethics Audit', 'You have been assigned as lead auditor for this compliance audit.', 'high', true, '/audits/550e8400-e29b-41d4-a716-446655440203'),
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440113', 'deadline_reminder', 'Upcoming Audit: Human Resources Compliance and Ethics Audit', 'Your business unit will be audited starting April 1st. Please prepare requested documentation.', 'medium', false, '/audits/550e8400-e29b-41d4-a716-446655440203'),

    -- Supply Chain Audit notifications
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440105', 'assignment', 'Draft Audit Created: Supply Chain and Vendor Management Audit', 'Your draft audit has been created. Please complete planning before submission.', 'medium', true, '/audits/550e8400-e29b-41d4-a716-446655440204/edit'),

    -- Quality Audit notifications
    ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440107', 'deadline_reminder', 'Overdue Audit: Product Quality and Manufacturing Controls', 'This audit is past its planned completion date. Please update status.', 'high', true, '/audits/550e8400-e29b-41d4-a716-446655440205'),

    -- Environmental Audit notifications
    ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440106', 'status_change', 'Audit Progress Update: Environmental Compliance and Sustainability Assessment', 'Audit is progressing well. Currently in reporting phase.', 'low', false, '/audits/550e8400-e29b-41d4-a716-446655440206')
;

-- Sample audit status history entries
INSERT INTO audit_status_history (audit_id, old_status, new_status, changed_by, changed_at, change_reason) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', 'draft', 'planning', '550e8400-e29b-41d4-a716-446655440105', '2024-01-10', 'Initial audit planning commenced'),
    ('550e8400-e29b-41d4-a716-446655440201', 'planning', 'in_progress', '550e8400-e29b-41d4-a716-446655440105', '2024-01-15', 'Audit fieldwork started'),
    ('550e8400-e29b-41d4-a716-446655440201', 'in_progress', 'testing', '550e8400-e29b-41d4-a716-446655440105', '2024-02-15', 'Moved to testing phase'),
    ('550e8400-e29b-41d4-a716-446655440201', 'testing', 'reporting', '550e8400-e29b-41d4-a716-446655440105', '2024-03-01', 'Testing complete, preparing report'),
    ('550e8400-e29b-41d4-a716-446655440201', 'reporting', 'completed', '550e8400-e29b-41d4-a716-446655440105', '2024-03-10', 'Audit completed successfully'),

    ('550e8400-e29b-41d4-a716-446655440202', 'draft', 'planning', '550e8400-e29b-41d4-a716-446655440106', '2024-01-25', 'SOX audit planning initiated'),
    ('550e8400-e29b-41d4-a716-446655440202', 'planning', 'in_progress', '550e8400-e29b-41d4-a716-446655440106', '2024-02-01', 'Fieldwork commenced'),

    ('550e8400-e29b-41d4-a716-446655440203', 'draft', 'planning', '550e8400-e29b-41d4-a716-446655440107', '2024-03-15', 'HR compliance audit planning started'),

    ('550e8400-e29b-41d4-a716-446655440205', 'draft', 'planning', '550e8400-e29b-41d4-a716-446655440107', '2023-12-15', 'Quality audit planning phase'),
    ('550e8400-e29b-41d4-a716-446655440205', 'planning', 'in_progress', '550e8400-e29b-41d4-a716-446655440107', '2024-01-01', 'Quality audit fieldwork started'),
    ('550e8400-e29b-41d4-a716-446655440205', 'in_progress', 'testing', '550e8400-e29b-41d4-a716-446655440107', '2024-02-01', 'Moved to testing controls'),

    ('550e8400-e29b-41d4-a716-446655440206', 'draft', 'planning', '550e8400-e29b-41d4-a716-446655440106', '2024-02-01', 'Environmental audit planning'),
    ('550e8400-e29b-41d4-a716-446655440206', 'planning', 'in_progress', '550e8400-e29b-41d4-a716-446655440106', '2024-02-15', 'Site visits and testing started'),
    ('550e8400-e29b-41d4-a716-446655440206', 'in_progress', 'reporting', '550e8400-e29b-41d4-a716-446655440106', '2024-04-15', 'Preparing final environmental report')
;

-- Comments and success message
COMMENT ON TABLE audits IS 'Enhanced with sample data for testing and demonstration';
COMMENT ON TABLE audit_team_members IS 'Sample team assignments across different audit types';
COMMENT ON TABLE audit_objectives IS 'Detailed objectives with AI generation examples';
COMMENT ON TABLE audit_time_entries IS 'Realistic time tracking data for analysis';
COMMENT ON TABLE audit_comments IS 'Collaborative comments showing audit workflow';
COMMENT ON TABLE audit_notifications IS 'Sample notification system data';
COMMENT ON TABLE audit_status_history IS 'Complete audit status progression tracking';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Audit sample data inserted successfully!';
    RAISE NOTICE 'Created 6 sample audits with:';
    RAISE NOTICE '  - 15 team member assignments';
    RAISE NOTICE '  - 10 detailed objectives';
    RAISE NOTICE '  - 13 time tracking entries';
    RAISE NOTICE '  - 7 audit comments';
    RAISE NOTICE '  - 10 notifications';
    RAISE NOTICE '  - 14 status history records';
    RAISE NOTICE 'Sample data includes completed, in-progress, planning, draft, and overdue audits.';
END
$$;
