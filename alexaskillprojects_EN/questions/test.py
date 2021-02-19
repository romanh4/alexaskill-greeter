import unittest
class AlexaTestUnit(unittest.TestCase):
    def setUp(self):
        pass
    def test_numbers_List(self):
        self.assertEqual( True, 3 not in [4, 5, 6])
 
if __name__ == '__main__':
    unittest.main()
