from abc import ABC, abstractmethod


class TerminologyProvider(ABC):
    """Source-neutral contract for future terminology adapters."""

    @abstractmethod
    def fetch_release(self):
        """Fetch one immutable source release."""

    @abstractmethod
    def normalize_terms(self):
        """Yield terms in MedBridge's normalized import shape."""


class DemoCsvProvider(TerminologyProvider):
    """Marker adapter for the Phase 8 synthetic CSV source."""

    def __init__(self, file_source):
        self.file_source = file_source

    def fetch_release(self):
        return self.file_source

    def normalize_terms(self):
        raise NotImplementedError(
            "Normalization is performed by terminology_import_service"
        )
