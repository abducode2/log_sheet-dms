-- Add UNIQUE constraint on 'no' for all tables to prevent duplicates on import
ALTER TABLE shop_drawings              ADD CONSTRAINT shop_drawings_no_unique              UNIQUE (no);
ALTER TABLE material_submittals        ADD CONSTRAINT material_submittals_no_unique        UNIQUE (no);
ALTER TABLE supplier_prequalifications ADD CONSTRAINT supplier_preq_no_unique             UNIQUE (no);
ALTER TABLE inspection_requests        ADD CONSTRAINT inspection_requests_no_unique        UNIQUE (no);
ALTER TABLE concrete_pour_requests     ADD CONSTRAINT concrete_pour_no_unique             UNIQUE (no);
ALTER TABLE requests_for_information   ADD CONSTRAINT rfi_no_unique                       UNIQUE (no);
ALTER TABLE non_conformance_reports    ADD CONSTRAINT ncr_no_unique                       UNIQUE (no);
ALTER TABLE document_transmittals      ADD CONSTRAINT transmittals_no_unique              UNIQUE (no);
ALTER TABLE letters_rawaf_naga         ADD CONSTRAINT letters_rawaf_naga_no_unique        UNIQUE (no);
ALTER TABLE letters_naga_rawaf         ADD CONSTRAINT letters_naga_rawaf_no_unique        UNIQUE (no);
